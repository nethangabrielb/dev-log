import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DsaService } from './dsa.service';
import { CreateDsaDto } from './dto/create-dsa.dto';
import { UpdateDsaDto } from './dto/update-dsa.dto';

@Controller('dsa')
export class DsaController {
  constructor(private readonly dsaService: DsaService) {}

  @Post()
  create(@Body() createDsaDto: CreateDsaDto) {
    return this.dsaService.create(createDsaDto);
  }

  @Get()
  findAll() {
    return this.dsaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dsaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDsaDto: UpdateDsaDto) {
    return this.dsaService.update(id, updateDsaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dsaService.remove(id);
  }
}
