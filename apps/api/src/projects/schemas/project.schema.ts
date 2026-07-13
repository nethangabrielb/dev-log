import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ProjectStatus, ProjectCategory } from '@devlog/types';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true, type: String, enum: ProjectCategory })
  category!: ProjectCategory;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
  })
  status?: ProjectStatus;

  @Prop({ default: [] })
  tags?: string[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
