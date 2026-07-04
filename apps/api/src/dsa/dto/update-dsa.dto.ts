import { PartialType } from '@nestjs/mapped-types';
import { CreateDsaDto } from './create-dsa.dto';

export class UpdateDsaDto extends PartialType(CreateDsaDto) {}
