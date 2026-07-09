import {
  IsString,
  IsInt,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsDate,
} from 'class-validator';

import { Difficulty, DsaPattern, ConfidenceLevel } from '@devlog/types';
import { Type } from 'class-transformer';

export class CreateDsaDto {
  @IsString()
  problemName!: string;

  @IsInt()
  problemNumber!: number;

  @IsEnum(Difficulty)
  difficulty!: Difficulty;

  @IsEnum(DsaPattern)
  pattern!: DsaPattern;

  @IsOptional()
  @IsBoolean()
  isSolved!: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  solvedAt?: Date;

  @IsEnum(ConfidenceLevel)
  confidenceLevel!: ConfidenceLevel;

  @IsOptional()
  @IsString()
  notes?: string;
}
