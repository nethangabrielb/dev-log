import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bullmq';
import { Model } from 'mongoose';
import { User } from '../users/schemas/users.schema';
import { normalizeTimezone } from '../common/timezone.util';

const JOB_NAME = 'generate-daily-report';
// Fires at 11 PM in each user's own local timezone.
const DAILY_REPORT_CRON = '0 23 * * *';

@Injectable()
export class DailyReportScheduler implements OnModuleInit {
  private readonly logger = new Logger(DailyReportScheduler.name);

  constructor(
    @InjectQueue('daily-report') private readonly dailyReportQueue: Queue,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  private schedulerId(userId: string): string {
    return `daily-report:${userId}`;
  }

  async onModuleInit() {
    const users = await this.userModel.find().select('_id timezone').exec();

    const desiredSchedulerIds = new Set<string>();

    for (const user of users) {
      const userId = user._id.toString();
      const timezone = normalizeTimezone(user.timezone);
      const schedulerId = this.schedulerId(userId);
      desiredSchedulerIds.add(schedulerId);

      // Idempotent upsert keyed by a deterministic id, so restarts never
      // create duplicate schedulers. The timezone drives both when the job
      // fires (tz) and which day the report covers.
      await this.dailyReportQueue.upsertJobScheduler(
        schedulerId,
        { pattern: DAILY_REPORT_CRON, tz: timezone },
        {
          name: JOB_NAME,
          data: { userId, timezone },
        },
      );
    }

    // Remove schedulers that no longer map to a user (deleted accounts or
    // the legacy single global job from the previous design).
    const existingSchedulers = await this.dailyReportQueue.getJobSchedulers();
    for (const scheduler of existingSchedulers) {
      if (scheduler.key && !desiredSchedulerIds.has(scheduler.key)) {
        await this.dailyReportQueue.removeJobScheduler(scheduler.key);
      }
    }

    this.logger.log(
      `Scheduled daily reports for ${users.length} user(s) at 23:00 local time`,
    );
  }
}
