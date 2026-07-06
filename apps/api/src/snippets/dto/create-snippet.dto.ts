import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { SnippetLanguage, SnippetCategory } from '@devlog/types';

export class CreateSnippetDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(SnippetLanguage)
  language!: SnippetLanguage;

  @IsEnum(SnippetCategory)
  category!: SnippetCategory;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
