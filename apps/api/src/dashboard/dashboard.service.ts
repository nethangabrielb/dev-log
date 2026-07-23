import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Session } from '../sessions/schemas/sessions.schema';
import { Project } from '../projects/schemas/project.schema';
import { Article } from '../articles/schema/articles.schema';
import { Model } from 'mongoose';
import { TodaysSessions } from '@devlog/types';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
  ) {}

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

  private async getTopSessionTypes(userId: string) {
    // 1. Get start of current week (Monday) and end of week (Sunday)
    // 2. Match sessions by userId and startedAt within this week
    // 3. Group by type, sum durationInSeconds
    // 4. Sort by totalDuration descending
    // 5. Limit to 3
    // 6. Return array of { type, totalDuration }
  }

  private async getActiveStreaks(userId: string) {
    // 1. Match sessions by userId
    // 2. Group by type and date (use $dateToString with 'Asia/Manila' as default timezone)
    // 3. For each type, walk the dates descending to count consecutive days (same toDayNumber logic from SessionsService)
    // 4. Return array of { type, currentStreak } — only include types with currentStreak > 0
  }

  private async getWeeklyBreakdown(userId: string, timezone: string) {
    // 1. Get start and end of current week
    // 2. Match sessions by userId and startedAt within this week
    // 3. Group by type, sum durationInSeconds
    // 4. Return array of { type, totalDuration }
  }

  private async getActiveProjects(userId: string) {
    // 1. Find projects by userId where status is active
    // 2. For each project, find the most recent session where linkedTo.id === project._id
    // 3. Return array of { name, lastSessionDate }
  }

  private async getReadingBacklog(userId: string) {
    // 1. Count articles by userId where status is Unread
    // 2. Return { unreadCount }
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
      this.getTopSessionTypes(userId),
      this.getActiveStreaks(userId),
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
