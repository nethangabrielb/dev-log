import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { SessionType } from '@devlog/types';
import { PaginationQueryDto } from '../../common/pagination-query.dto';

export class SessionFiltersDto extends PaginationQueryDto {
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
