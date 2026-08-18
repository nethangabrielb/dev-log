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

  async upsertUserScheduler(userId: string, timezone?: string): Promise<void> {
    const tz = normalizeTimezone(timezone);
    await this.dailyReportQueue.upsertJobScheduler(
      this.schedulerId(userId),
      { pattern: DAILY_REPORT_CRON, tz },
      {
        name: JOB_NAME,
        data: { userId, timezone: tz },
      },
    );
  }

  async removeUserScheduler(userId: string): Promise<void> {
    await this.dailyReportQueue.removeJobScheduler(this.schedulerId(userId));
  }

  async onModuleInit() {
    try {
      await this.syncSchedulers();
    } catch (err) {
      this.logger.error(
        'Failed to sync daily report schedulers on startup:',
        err,
      );
    }
  }

  async syncSchedulers() {
    // 1. Fetch existing schedulers from Redis in a single read
    const existingSchedulers = await this.dailyReportQueue.getJobSchedulers();
    const existingMap = new Map(
      existingSchedulers.filter((s) => Boolean(s.key)).map((s) => [s.key, s]),
    );

    // 2. Fetch active users from DB
    const users = await this.userModel
      .find()
      .select('_id timezone')
      .lean()
      .exec();
    const desiredSchedulerIds = new Set<string>();

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let removedCount = 0;

    // 3. Diff and upsert only additions or modifications
    for (const user of users) {
      const userId = user._id.toString();
      const timezone = normalizeTimezone(user.timezone);
      const schedulerId = this.schedulerId(userId);
      desiredSchedulerIds.add(schedulerId);

      const existing = existingMap.get(schedulerId);

      if (!existing) {
        // Scheduler doesn't exist in Redis -> create
        await this.dailyReportQueue.upsertJobScheduler(
          schedulerId,
          { pattern: DAILY_REPORT_CRON, tz: timezone },
          {
            name: JOB_NAME,
            data: { userId, timezone },
          },
        );
        createdCount++;
      } else {
        // Scheduler exists -> check if cron pattern or timezone changed
        const patternChanged = existing.pattern !== DAILY_REPORT_CRON;
        const tzChanged = (existing.tz ?? '') !== (timezone ?? '');

        if (patternChanged || tzChanged) {
          await this.dailyReportQueue.upsertJobScheduler(
            schedulerId,
            { pattern: DAILY_REPORT_CRON, tz: timezone },
            {
              name: JOB_NAME,
              data: { userId, timezone },
            },
          );
          updatedCount++;
        } else {
          skippedCount++;
        }
      }
    }

    // 4. Prune stale schedulers (deleted users or deprecated global jobs)
    for (const scheduler of existingSchedulers) {
      if (scheduler.key && !desiredSchedulerIds.has(scheduler.key)) {
        await this.dailyReportQueue.removeJobScheduler(scheduler.key);
        removedCount++;
      }
    }

    this.logger.log(
      `Daily report schedulers synced: ${skippedCount} unchanged (skipped writes), ` +
        `${createdCount} created, ${updatedCount} updated, ${removedCount} removed ` +
        `(${users.length} total users)`,
    );
  }
}
