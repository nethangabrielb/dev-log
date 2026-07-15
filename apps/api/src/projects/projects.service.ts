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
import { TotalTimeLogged, TasksCompleted } from '@devlog/types';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  create(createProjectDto: CreateProjectDto, userId: string) {
    return this.projectModel.create({ ...createProjectDto, userId });
  }

  findAll(userId: string) {
    return this.projectModel.find({ userId }).exec();
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
    return project.deleteOne();
  }

  // STATISTICS
  async getTotalTimeLogged(
    projectId: string,
    userId: string,
  ): Promise<TotalTimeLogged> {
    const sessions = (await this.sessionModel
      .aggregate([
        { $match: { userId, 'linkedTo.id': projectId } },
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
    projectId: string,
    userId: string,
  ): Promise<TasksCompleted> {
    const sessions = await this.sessionModel.aggregate([
      { $match: { userId, 'linkedTo.id': projectId } },
      { $unwind: '$todos' },
      { $match: { 'todos.completed': true } },
      { $count: 'totalCompleted' },
    ]);

    return (sessions[0] as TasksCompleted) ?? { totalCompleted: 0 };
  }

  async getSessionFrequencyOverTime(
    projectId: string,
    userId: string,
    timezone: string,
  ) {
    const results = await this.sessionModel.aggregate([
      { $match: { userId, 'linkedTo.id': projectId } },
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
        this.getTotalTimeLogged(id, userId),
        this.getTasksCompleted(id, userId),
        this.getSessionFrequencyOverTime(id, userId, timezone),
      ]);
    return {
      totalTimeLogged: totalTimeLogged,
      tasksCompleted: tasksCompleted,
      sessionFrequencyOverTime: sessionFrequencyOverTime,
    };
  }
}
