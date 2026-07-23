import { Processor, WorkerHost } from '@nestjs/bullmq';
import { DailyReportService } from './daily-report.service';

@Processor('daily-report')
export class DailyReportProcessor extends WorkerHost {
  constructor(private readonly dailyReportService: DailyReportService) {
    super();
  }

  async process() {
    await this.dailyReportService.generateDailyReport();
  }
}
