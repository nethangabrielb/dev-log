import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { SessionType } from '@devlog/types';

export class SessionFiltersDto {
  @IsOptional()
  @IsEnum(SessionType)
  type?: SessionType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
