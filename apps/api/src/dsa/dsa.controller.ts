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
  findAll(@Req() req: any) {
    const userId = req.user.userId;
    return this.dsaService.findAll(userId);
  }

  @Get('statistics')
  getStatistics(@Req() req: any) {
    const userId = req.user.userId;
    return this.dsaService.getStatistics(userId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.dsaService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateDsaDto: UpdateDsaDto,
  ) {
    const userId = req.user.userId;
    return this.dsaService.update(id, updateDsaDto, userId);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.dsaService.remove(id, userId);
  }
}
