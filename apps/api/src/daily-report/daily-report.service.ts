import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/users.schema';
import { Session, SessionDocument } from '../sessions/schemas/sessions.schema';
import { DailyReport } from './schema/daily-report.schema';
import { normalizeTimezone } from '../common/timezone.util';

@Injectable()
export class DailyReportService {
  private readonly logger = new Logger(DailyReportService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
    @InjectModel(DailyReport.name)
    private readonly dailyReportModel: Model<DailyReport>,
  ) {}

  async findAll(userId: string) {
    const dailyReports = await this.dailyReportModel
      .find({ userId })
      .sort({ date: -1 })
      .exec();
    return dailyReports;
  }

  async findOne(userId: string, date: string) {
    const dailyReport = await this.dailyReportModel
      .findOne({ userId, date })
      .exec();
    return dailyReport;
  }

  async markAsRead(userId: string, date: string) {
    const dailyReport = await this.dailyReportModel
      .findOneAndUpdate(
        { userId, date },
        { $set: { isRead: true } },
        { returnDocument: 'after' },
      )
      .exec();
    return dailyReport;
  }

  private async getUserSessionsForToday(
    userId: string,
    timezone: string,
  ): Promise<SessionDocument[]> {
    const sessions = await this.sessionModel.aggregate([
      {
        $match: {
          userId,
          $expr: {
            $eq: [
              {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$startedAt',
                  timezone,
                },
              },
              {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: new Date(),
                  timezone,
                },
              },
            ],
          },
        },
      },
    ]);

    return sessions as SessionDocument[];
  }

  /**
   * Generates the daily report for a single user. One user's failure (bad
   * data, an invalid timezone slipping through, a deleted account, ...) is
   * caught and logged here so it can never fail the other users' jobs.
   */
  async generateDailyReport(userId: string) {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        this.logger.warn(`User ${userId} no longer exists; skipping report`);
        return;
      }

      const timezone = normalizeTimezone(user.timezone);

      const sessions = await this.getUserSessionsForToday(userId, timezone);
      if (!sessions.length) {
        return;
      }

      const totalTimeLogged = sessions.reduce(
        (sum, session) => sum + session.durationInSeconds,
        0,
      );

      const completedTodos = sessions.flatMap((session) =>
        session.todos.filter((todo) => todo.completed),
      ).length;

      const breakdownBySessionType = Object.values(
        sessions.reduce(
          (acc, session) => {
            if (!acc[session.type]) {
              acc[session.type] = {
                type: session.type,
                durationInSeconds: 0,
                tasksCompleted: 0,
              };
            }
            acc[session.type].durationInSeconds += session.durationInSeconds;
            acc[session.type].tasksCompleted += session.todos.filter(
              (todo) => todo.completed,
            ).length;
            return acc;
          },
          {} as Record<
            string,
            {
              type: string;
              durationInSeconds: number;
              tasksCompleted: number;
            }
          >,
        ),
      );

      const topSessionType = breakdownBySessionType.reduce(
        (top, entry) =>
          entry.durationInSeconds > top.durationInSeconds ? entry : top,
        breakdownBySessionType[0],
      ).type;

      const date = new Date().toLocaleDateString('en-CA', { timeZone: timezone });

      // $set preserves fields that are not part of the regeneration, e.g. an
      // existing isRead flag must not be reset when the same date re-runs.
      await this.dailyReportModel.findOneAndUpdate(
        { userId, date },
        {
          $set: {
            totalTimeLogged,
            totalTasksCompleted: completedTodos,
            topSessionType,
            breakdownBySessionType,
          },
        },
        { upsert: true, returnDocument: 'after' },
      );
    } catch (error) {
      this.logger.error(
        `Failed to generate daily report for user ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
