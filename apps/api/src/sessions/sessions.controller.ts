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
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Body() createSessionDto: CreateSessionDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.sessionsService.create(createSessionDto, userId);
  }

  @Get()
  findAll(@Req() req: any) {
    const userId = req.user.userId;
    return this.sessionsService.findAll(userId);
  }

  @Get('statistics')
  getStatistics(@Req() req: any) {
    const userId = req.user.userId;
    return this.sessionsService.getStatistics(userId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.sessionsService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ) {
    const userId = req.user.userId;
    return this.sessionsService.update(id, updateSessionDto, userId);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId;
    return this.sessionsService.remove(id, userId);
  }
}
