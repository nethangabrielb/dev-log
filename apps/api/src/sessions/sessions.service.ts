import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from './schemas/sessions.schema';
import {
  TotalByType,
  AveragePerDay,
  MostProductiveDay,
  TotalTimeSpent,
  SessionCountOverTime,
  SessionStatistics,
} from '@devlog/types';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
  ) {}

  // CRUD operations for sessions
  async create(createSessionDto: CreateSessionDto, userId: string) {
    const createdSession = new this.sessionModel({
      ...createSessionDto,
      userId,
    });
    return createdSession.save();
  }

  async findAll(userId: string) {
    return this.sessionModel.find({ userId }).exec();
  }

  async findOne(id: string) {
    return this.sessionModel.findById(id).exec();
  }

  async update(id: string, updateSessionDto: UpdateSessionDto) {
    return this.sessionModel
      .findByIdAndUpdate(id, updateSessionDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    return this.sessionModel.findByIdAndDelete(id).exec();
  }

  // STATISTICS
  private async getTotalByType(userId: string): Promise<TotalByType[]> {
    return this.sessionModel.aggregate([
      { $match: { userId } },
      {
        $group: { _id: '$type', totalDuration: { $sum: '$durationInSeconds' } },
      },
      { $sort: { totalDuration: -1 } },
    ]);
  }

  private async getAveragePerDay(userId: string): Promise<AveragePerDay> {
    const result = await this.sessionModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
          totalDuration: { $sum: '$durationInSeconds' },
        },
      },
      { $group: { _id: null, averageDuration: { $avg: '$totalDuration' } } },
    ]);

    return (result[0] as AveragePerDay) || null;
  }

  private async getMostProductiveDay(
    userId: string,
  ): Promise<MostProductiveDay> {
    const result = await this.sessionModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
          totalDuration: { $sum: '$durationInSeconds' },
        },
      },
      { $sort: { totalDuration: -1 } },
      { $limit: 1 },
    ]);

    return (result[0] as MostProductiveDay) || null;
  }

  private async getTotalTimeSpent(userId: string): Promise<TotalTimeSpent> {
    const result = await this.sessionModel.aggregate([
      { $match: { userId } },
      {
        $group: { _id: null, totalDuration: { $sum: '$durationInSeconds' } },
      },
    ]);
    return (result[0] as TotalTimeSpent) || null;
  }

  private async getTotalSessions(userId: string): Promise<number> {
    return this.sessionModel.countDocuments({
      userId,
    });
  }

  private async getSessionCountOverTime(
    userId: string,
  ): Promise<SessionCountOverTime[]> {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    return this.sessionModel.aggregate([
      {
        $match: {
          userId,
          startedAt: { $gte: fourteenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  private async getCurrentStreak(userId: string): Promise<number> {
    const days: Array<{ _id: string }> = await this.sessionModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$startedAt',
              timezone: 'Asia/Manila',
            },
          },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    if (days.length === 0) return 0;

    const dates: string[] = days.map((d) => d._id);

    const todayStr = new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Manila',
    });
    const yesterdayStr = new Date(Date.now() - 86400000).toLocaleDateString(
      'en-CA',
      { timeZone: 'Asia/Manila' },
    );

    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
      return 0;
    }

    const toDayNumber = (dateString: string) => {
      const [year, month, day] = dateString.split('-').map(Number);
      return Date.UTC(year, month - 1, day) / 86400000;
    };

    let streak = 1;

    for (let i = 1; i < dates.length; i++) {
      const previousDay = toDayNumber(dates[i - 1]);
      const currentDay = toDayNumber(dates[i]);

      if (previousDay - currentDay === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  async getStatistics(userId: string): Promise<SessionStatistics> {
    const [
      totalByType,
      averagePerDay,
      mostProductiveDay,
      totalTimeSpent,
      totalSessions,
      sessionCountOverTime,
      currentStreak,
    ] = await Promise.all([
      this.getTotalByType(userId),
      this.getAveragePerDay(userId),
      this.getMostProductiveDay(userId),
      this.getTotalTimeSpent(userId),
      this.getTotalSessions(userId),
      this.getSessionCountOverTime(userId),
      this.getCurrentStreak(userId),
    ]);

    return {
      totalByType,
      averagePerDay,
      mostProductiveDay,
      totalTimeSpent,
      totalSessions,
      sessionCountOverTime,
      currentStreak,
    };
  }
}
