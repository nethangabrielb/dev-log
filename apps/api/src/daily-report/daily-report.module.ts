import { Module } from '@nestjs/common';
import { DailyReportService } from './daily-report.service';
import { DailyReportController } from './daily-report.controller';

@Module({
  providers: [DailyReportService],
  controllers: [DailyReportController]
})
export class DailyReportModule {}
