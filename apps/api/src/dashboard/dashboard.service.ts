import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { startOfWeek, endOfWeek } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { Session } from '../sessions/schemas/sessions.schema';
import { Project } from '../projects/schemas/project.schema';
import { Article } from '../articles/schema/articles.schema';
import { Model } from 'mongoose';
import {
  TodaysSessions,
  TopSessions,
  ProjectStatus,
  ArticleStatus,
} from '@devlog/types';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
  ) {}

  private getWeekBoundaries(timezone: string) {
    const zonedNow = toZonedTime(new Date(), timezone);
    const startWall = startOfWeek(zonedNow, { weekStartsOn: 1 });
    const endWall = endOfWeek(zonedNow, { weekStartsOn: 1 });
    return {
      startOfWeek: fromZonedTime(startWall, timezone),
      endOfWeek: fromZonedTime(endWall, timezone),
    };
  }

  private async getTodaysSessions(
    userId: string,
    timezone: string,
  ): Promise<TodaysSessions> {
    const todaysSessions = await this.sessionModel.aggregate([
      // aggregate sessions where userId matches and date matches today's date in the given timezone
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
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalDuration: { $sum: '$durationInSeconds' },
        },
      },
      {
        $project: {
          _id: 0,
          totalSessions: 1,
          totalDuration: 1,
        },
      },
    ]);

    return (
      (todaysSessions[0] as TodaysSessions) || {
        totalSessions: 0,
        totalDuration: 0,
      }
    );
  }

  private async getTopSessionTypes(
    userId: string,
    timezone: string,
  ): Promise<TopSessions[]> {
    const { startOfWeek, endOfWeek } = this.getWeekBoundaries(timezone);

    const topSessionTypes = await this.sessionModel.aggregate([
      {
        $match: {
          userId,
          startedAt: {
            $gte: startOfWeek,
            $lte: endOfWeek,
          },
        },
      },
      {
        $group: {
          _id: '$type',
          totalDuration: { $sum: '$durationInSeconds' },
        },
      },
      {
        $sort: { totalDuration: -1 },
      },
      {
        $limit: 3,
      },
      {
        $project: {
          _id: 0,
          type: '$_id',
          totalDuration: 1,
        },
      },
    ]);
    return topSessionTypes as TopSessions[];
  }

  private async getActiveStreaks(userId: string, timezone: string) {
    const results = await this.sessionModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            type: '$type',
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$startedAt',
                timezone,
              },
            },
          },
        },
      },
      { $sort: { '_id.date': -1 } },
    ]);

    const byType: Record<string, string[]> = {};
    for (const doc of results) {
      const { type, date } = doc._id;
      if (!byType[type]) byType[type] = [];
      byType[type].push(date);
    }

    const toDayNumber = (date: string) => {
      const [y, m, d] = date.split('-').map(Number);
      return Date.UTC(y, m - 1, d) / 86400000;
    };

    return Object.entries(byType)
      .map(([type, dates]) => {
        let streak = 0;
        let expected = toDayNumber(
          new Date().toLocaleDateString('en-CA', { timeZone: timezone }),
        );
        for (const date of dates) {
          if (toDayNumber(date) === expected) {
            streak++;
            expected--;
          } else break;
        }
        return { type, currentStreak: streak };
      })
      .filter((s) => s.currentStreak > 0);
  }

  private async getWeeklyBreakdown(userId: string, timezone: string) {
    const { startOfWeek, endOfWeek } = this.getWeekBoundaries(timezone);

    return this.sessionModel.aggregate([
      {
        $match: {
          userId,
          startedAt: { $gte: startOfWeek, $lte: endOfWeek },
        },
      },
      {
        $group: {
          _id: '$type',
          totalDuration: { $sum: '$durationInSeconds' },
        },
      },
      {
        $project: {
          _id: 0,
          type: '$_id',
          totalDuration: 1,
        },
      },
    ]);
  }

  private async getActiveProjects(userId: string) {
    const projects = await this.projectModel.find({
      userId,
      status: ProjectStatus.ACTIVE,
    });

    return Promise.all(
      projects.map(async (project) => {
        const lastSession = await this.sessionModel
          .findOne({ userId, 'linkedTo.id': project._id.toString() })
          .sort({ startedAt: -1 })
          .select('startedAt')
          .exec();

        return {
          name: project.name,
          lastSessionDate: lastSession?.startedAt ?? null,
        };
      }),
    );
  }

  private async getReadingBacklog(userId: string) {
    const unreadCount = await this.articleModel.countDocuments({
      userId,
      status: ArticleStatus.UNREAD,
    });

    return { unreadCount };
  }

  async getDashboardData(userId: string, timezone: string) {
    const [
      todaysSessions,
      topSessionTypes,
      activeStreaks,
      weeklyBreakdown,
      activeProjects,
      readingBacklog,
    ] = await Promise.all([
      this.getTodaysSessions(userId, timezone),
      this.getTopSessionTypes(userId, timezone),
      this.getActiveStreaks(userId, timezone),
      this.getWeeklyBreakdown(userId, timezone),
      this.getActiveProjects(userId),
      this.getReadingBacklog(userId),
    ]);

    return {
      todaysSessions,
      topSessionTypes,
      activeStreaks,
      weeklyBreakdown,
      activeProjects,
      readingBacklog,
    };
  }
}
