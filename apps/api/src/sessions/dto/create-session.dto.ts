import {
  IsString,
  IsInt,
  IsDate,
  IsBoolean,
  IsArray,
  IsEnum,
  IsMongoId,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// session type
export enum SessionType {
  PROJECT = 'Projects',
  ARTICLE = 'Article Reading',
  DSA = 'DSA Problems',
  STUDY = 'Study',
}

// session linked to kind
export enum LinkedToKind {
  PROJECT = 'Projects',
  ARTICLE = 'Article Reading',
  DSA = 'DSA Problems',
  STUDY = 'Study',
}

// DTO shape of Session Todo
class TodoDto {
  @IsString()
  name!: string;

  @IsBoolean()
  completed!: boolean;
}

// DTO shape of Session LinkedTo
class LinkedToDto {
  @IsEnum(LinkedToKind)
  kind!: LinkedToKind;

  @IsMongoId()
  id!: string;
}

// Session overall shape
export class CreateSessionDto {
  @IsEnum(SessionType)
  type!: SessionType;

  @IsInt()
  duration!: number;

  @IsDate()
  @Type(() => Date)
  startedAt!: Date;

  @IsDate()
  @Type(() => Date)
  endedAt!: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TodoDto)
  todos!: Array<TodoDto>;

  @ValidateNested()
  @Type(() => LinkedToDto)
  linkedTo?: LinkedToDto;
}
