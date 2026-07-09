import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { DsaService } from './dsa.service';
import { CreateDsaDto } from './dto/create-dsa.dto';
import { UpdateDsaDto } from './dto/update-dsa.dto';

@Controller('dsa')
export class DsaController {
  constructor(private readonly dsaService: DsaService) {}

  @Post()
  create(@Req() req: any, @Body() createDsaDto: CreateDsaDto) {
    return this.dsaService.create(createDsaDto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.dsaService.findAll();
  }

  @Get('statistics')
  getStatistics(@Req() req: any) {
    const userId = req.user.userId;
    return this.dsaService.getStatistics(userId);
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
