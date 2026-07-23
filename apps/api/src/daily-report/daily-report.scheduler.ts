import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class DailyReportScheduler implements OnModuleInit {
  constructor(
    @InjectQueue('daily-report') private readonly dailyReportQueue: Queue,
  ) {}

  async onModuleInit() {
    const jobs = await this.dailyReportQueue.getJobSchedulers();
    const hasDailyReportJob = jobs.some(
      (job) => job.name === 'generate-daily-report',
    );

    if (hasDailyReportJob) {
      await this.dailyReportQueue.removeJobScheduler('generate-daily-report');
    }

    await this.dailyReportQueue.add(
      'generate-daily-report',
      {},
      {
        repeat: { pattern: '0 23 * * *' },
      },
    );
  }
}
