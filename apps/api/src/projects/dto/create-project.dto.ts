import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ProjectCategory, ProjectStatus } from '@devlog/types';

export class CreateProjectDto {
  @IsString()
  name!: string;

  @IsEnum(ProjectCategory)
  category!: ProjectCategory;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
