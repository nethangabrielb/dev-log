import { Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { DailyReportService } from './daily-report.service';

@Controller('daily-report')
export class DailyReportController {
  constructor(private readonly dailyReportService: DailyReportService) {}

  @Get()
  findAll(@Req() req: any) {
    const userId = req.user.userId;
    return this.dailyReportService.findAll(userId);
  }

  @Get(':date')
  findOne(@Req() req: any, @Param('date') date: string) {
    const userId = req.user.userId;
    return this.dailyReportService.findOne(userId, date);
  }

  @Patch(':date/read')
  markAsRead(@Req() req: any, @Param('date') date: string) {
    const userId = req.user.userId;
    return this.dailyReportService.markAsRead(userId, date);
  }
}
