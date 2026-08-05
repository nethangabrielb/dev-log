import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, ProjectDocument } from './schemas/project.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session, SessionDocument } from '../sessions/schemas/sessions.schema';
import { PaginationQueryDto } from '../common/pagination-query.dto';
import { buildPaginatedResult } from '../common/pagination.util';
import {
  LinkedToKind,
  ProjectsCategoryBreakdown,
  ProjectsStatistics,
  ProjectsStatusBreakdown,
  TasksCompleted,
  TotalTimeLogged,
} from '@devlog/types';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  create(createProjectDto: CreateProjectDto, userId: string) {
    return this.projectModel.create({ ...createProjectDto, userId });
  }

  async findAll(userId: string, pagination: Partial<PaginationQueryDto> = {}) {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 20;
    const filter = { userId };
    const [data, total] = await Promise.all([
      this.projectModel
        .find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.projectModel.countDocuments(filter),
    ]);
    return buildPaginatedResult(data, total, page, limit);
  }

  async findOne(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid ID');
    const project = await this.projectModel.findById(id).exec();
    if (!project || project.userId !== userId) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid ID');
    const project = await this.projectModel.findById(id).exec();
    if (!project || project.userId !== userId) {
      throw new NotFoundException('Project not found');
    }
    Object.assign(project, updateProjectDto);
    return project.save();
  }

  async remove(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid ID');
    const project = await this.projectModel.findById(id).exec();
    if (!project || project.userId !== userId) {
      throw new NotFoundException('Project not found');
    }
    await this.sessionModel
      .updateMany(
        {
          userId,
          'linkedTo.kind': LinkedToKind.PROJECT,
          'linkedTo.id': id,
        },
        { $unset: { linkedTo: '' } },
      )
      .exec();
    return project.deleteOne();
  }

  // STATISTICS
  private buildLinkedToMatch(userId: string, projectId?: string) {
    return projectId
      ? { userId, 'linkedTo.id': projectId }
      : { userId, 'linkedTo.kind': LinkedToKind.PROJECT };
  }

  async getTotalTimeLogged(
    userId: string,
    projectId?: string,
  ): Promise<TotalTimeLogged> {
    const sessions = (await this.sessionModel
      .aggregate([
        { $match: this.buildLinkedToMatch(userId, projectId) },
        {
          $group: { _id: null, totalDuration: { $sum: '$durationInSeconds' } },
        },
        {
          $project: { _id: 0, totalDuration: 1 },
        },
      ])
      .exec()) as TotalTimeLogged[];

    return sessions[0] ?? { totalDuration: 0 };
  }

  async getTasksCompleted(
    userId: string,
    projectId?: string,
  ): Promise<TasksCompleted> {
    const sessions = await this.sessionModel.aggregate([
      { $match: this.buildLinkedToMatch(userId, projectId) },
      { $unwind: '$todos' },
      { $match: { 'todos.completed': true } },
      { $count: 'totalCompleted' },
    ]);

    return (sessions[0] as TasksCompleted) ?? { totalCompleted: 0 };
  }

  async getSessionFrequencyOverTime(
    userId: string,
    timezone: string,
    projectId?: string,
  ) {
    const results = await this.sessionModel.aggregate([
      { $match: this.buildLinkedToMatch(userId, projectId) },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$startedAt',
              timezone,
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // fill last 14 days
    const today = new Date();
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (13 - i));
      return d.toLocaleDateString('en-CA', { timeZone: timezone });
    });

    const map = Object.fromEntries(results.map((r) => [r._id, r.count]));
    return days.map((date) => ({ date, count: map[date] ?? 0 }));
  }

  async getStats(id: string, userId: string, timezone: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid ID');

    const project = await this.projectModel.findById(id).exec();
    if (!project || project.userId !== userId)
      throw new NotFoundException('Project not found');

    const [totalTimeLogged, tasksCompleted, sessionFrequencyOverTime] =
      await Promise.all([
        this.getTotalTimeLogged(userId, id),
        this.getTasksCompleted(userId, id),
        this.getSessionFrequencyOverTime(userId, timezone, id),
      ]);
    return {
      totalTimeLogged: totalTimeLogged,
      tasksCompleted: tasksCompleted,
      sessionFrequencyOverTime: sessionFrequencyOverTime,
    };
  }

  async getTotalProjects(userId: string): Promise<number> {
    return this.projectModel.countDocuments({ userId }).exec();
  }

  async getBreakdownByStatus(
    userId: string,
  ): Promise<ProjectsStatusBreakdown[]> {
    const res = await this.projectModel
      .aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } },
      ])
      .exec();

    return res as ProjectsStatusBreakdown[];
  }

  async getBreakdownByCategory(
    userId: string,
  ): Promise<ProjectsCategoryBreakdown[]> {
    const res = await this.projectModel
      .aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $project: { _id: 0, category: '$_id', count: 1 } },
      ])
      .exec();

    return res as ProjectsCategoryBreakdown[];
  }

  async getStatistics(
    userId: string,
    timezone: string,
  ): Promise<ProjectsStatistics> {
    const [
      totalProjects,
      totalTimeLogged,
      tasksCompleted,
      breakdownByStatus,
      breakdownByCategory,
      sessionActivityOverTime,
    ] = await Promise.all([
      this.getTotalProjects(userId),
      this.getTotalTimeLogged(userId),
      this.getTasksCompleted(userId),
      this.getBreakdownByStatus(userId),
      this.getBreakdownByCategory(userId),
      this.getSessionFrequencyOverTime(userId, timezone),
    ]);

    return {
      totalProjects,
      totalTimeLogged: totalTimeLogged.totalDuration,
      totalTasksCompleted: tasksCompleted.totalCompleted,
      breakdownByStatus,
      breakdownByCategory,
      sessionActivityOverTime,
    };
  }
}
