import {
  IsString,
  IsInt,
  IsBoolean,
  IsEnum,
  IsOptional,
} from 'class-validator';

import { Difficulty, DsaPattern, ConfidenceLevel } from '@devlog/types';

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

  @IsEnum(ConfidenceLevel)
  confidenceLevel!: ConfidenceLevel;

  @IsOptional()
  @IsString()
  notes?: string;
}
