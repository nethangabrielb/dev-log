import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ArticleCategory, ArticleStatus } from '@devlog/types';

export class CreateArticleDto {
  @IsString()
  url!: string;

  @IsString()
  title!: string;

  @IsEnum(ArticleCategory)
  category!: ArticleCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;
}
