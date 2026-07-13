import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './schemas/project.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
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
}
