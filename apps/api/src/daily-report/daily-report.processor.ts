import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DailyReportService } from './daily-report.service';

interface GenerateDailyReportJobData {
  userId: string;
  timezone: string;
}

@Processor('daily-report')
export class DailyReportProcessor extends WorkerHost {
  constructor(private readonly dailyReportService: DailyReportService) {
    super();
  }

  async process(job: Job<GenerateDailyReportJobData>) {
    await this.dailyReportService.generateDailyReport(job.data.userId);
  }
}
