import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionFiltersDto } from './dto/session-filters.dto';
import { ExportSessionDto } from './dto/export-session.dto';
import { DailyActivityQueryDto } from './dto/daily-activity-query.dto';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Body() createSessionDto: CreateSessionDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.sessionsService.create(createSessionDto, userId);
  }

  @Get()
  findAll(@Query() filters: SessionFiltersDto, @Req() req: any) {
    const userId = req.user.userId;
    const timezone = req.user.timezone || 'Etc/UTC';
    return this.sessionsService.findAll(userId, filters, timezone);
  }

  @Get('streaks')
  getStreaks(@Req() req: any) {
    const userId = req.user.userId;
    const timezone = req.user.timezone || 'Etc/UTC';
    return this.sessionsService.getStreaks(userId, timezone);
  }

  @Get('statistics')
  getStatistics(@Req() req: any) {
    const userId = req.user.userId;
    const timezone = req.user.timezone || 'Etc/UTC';
    return this.sessionsService.getStatistics(userId, timezone);
  }

  @Get('activity')
  getActivity(@Query() query: DailyActivityQueryDto, @Req() req: any) {
    const userId = req.user.userId;
    const timezone = query.timezone || req.user.timezone || 'Etc/UTC';
    return this.sessionsService.getDailyActivity(userId, timezone, query.days);
  }

  @Get('export')
  export(
    @Query() query: ExportSessionDto,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.userId;
    const timezone = req.user.timezone || 'Etc/UTC';

    const { stream, filename, contentType } =
      this.sessionsService.exportSessions(userId, query, timezone);

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(stream);
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
