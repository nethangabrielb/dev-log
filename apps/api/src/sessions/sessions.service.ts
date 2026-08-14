import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Readable } from 'stream';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { ExportSessionDto } from './dto/export-session.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session } from './schemas/sessions.schema';
import { fromZonedTime } from 'date-fns-tz';
import { PaginationQueryDto } from '../common/pagination-query.dto';
import { buildPaginatedResult } from '../common/pagination.util';
import {
  TotalByType,
  AveragePerDay,
  MostProductiveDay,
  TotalTimeSpent,
  SessionCountOverTime,
  SessionStatistics,
  SessionFilters,
  SessionType,
  ExportFormat,
} from '@devlog/types';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
  ) {}

  // CRUD operations for sessions
  async create(createSessionDto: CreateSessionDto, userId: string) {
    const { startedAt, endedAt, durationInSeconds } = createSessionDto;

    const started = startedAt.getTime();
    const ended = endedAt.getTime();

    if (ended <= started) {
      throw new BadRequestException('endedAt must be after startedAt');
    }

    if (durationInSeconds > 86400) {
      throw new BadRequestException(
        'durationInSeconds cannot exceed 24 hours (86400 seconds)',
      );
    }

    const actualDuration = (ended - started) / 1000;
    if (Math.abs(durationInSeconds - actualDuration) > 5) {
      throw new BadRequestException(
        'durationInSeconds does not match the difference between startedAt and endedAt',
      );
    }

    const createdSession = new this.sessionModel({
      ...createSessionDto,
      userId,
    });
    return createdSession.save();
  }

  async findAll(
    userId: string,
    filters: SessionFilters & Partial<PaginationQueryDto> = {},
    timezone = 'Etc/UTC',
  ) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const query: Record<string, any> = { userId };
    if (filters.type) query.type = filters.type;
    if (filters.startDate) {
      query.startedAt = {
        ...(query.startedAt ?? {}),
        $gte: fromZonedTime(`${filters.startDate}T00:00:00.000`, timezone),
      };
    }
    if (filters.endDate) {
      query.startedAt = {
        ...(query.startedAt ?? {}),
        $lte: fromZonedTime(`${filters.endDate}T23:59:59.999`, timezone),
      };
    }

    const [data, total] = await Promise.all([
      this.sessionModel
        .find(query)
        .sort({ startedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.sessionModel.countDocuments(query),
    ]);

    return buildPaginatedResult(data, total, page, limit);
  }

  exportSessions(
    userId: string,
    filters: ExportSessionDto,
    timezone = 'Etc/UTC',
  ) {
    const sessionType = filters.type ?? filters.sessionType;
    const query: Record<string, any> = { userId };
    if (sessionType) query.type = sessionType;
    if (filters.startDate) {
      query.startedAt = {
        ...(query.startedAt ?? {}),
        $gte: fromZonedTime(`${filters.startDate}T00:00:00.000`, timezone),
      };
    }
    if (filters.endDate) {
      query.startedAt = {
        ...(query.startedAt ?? {}),
        $lte: fromZonedTime(`${filters.endDate}T23:59:59.999`, timezone),
      };
    }

    const cursor = this.sessionModel
      .find(query)
      .sort({ startedAt: -1 })
      .cursor();

    const isCsv = filters.format === ExportFormat.CSV;
    const filename = isCsv ? 'sessions-export.csv' : 'sessions-export.md';
    const contentType = isCsv
      ? 'text/csv; charset=utf-8'
      : 'text/markdown; charset=utf-8';

    const escapeCsv = (val: any): string => {
      if (val === undefined || val === null) return '';
      const str = String(val instanceof Date ? val.toISOString() : val);
      if (
        str.includes(',') ||
        str.includes('"') ||
        str.includes('\n') ||
        str.includes('\r')
      ) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const escapeMd = (val: any): string => {
      if (val === undefined || val === null) return '-';
      const str = String(val instanceof Date ? val.toISOString() : val).trim();
      if (!str) return '-';
      return str.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
    };

    async function* generateRows() {
      if (isCsv) {
        yield 'ID,Type,Duration (Seconds),Started At,Ended At,Todos,Linked Kind,Linked ID\n';
        for await (const doc of cursor) {
          const todosStr = (doc.todos || [])
            .map((t: any) => `${t.completed ? '[x]' : '[ ]'} ${t.name}`)
            .join('; ');
          const linkedKind = doc.linkedTo?.kind || '';
          const linkedId = doc.linkedTo?.id || '';

          yield [
            escapeCsv(doc._id),
            escapeCsv(doc.type),
            escapeCsv(doc.durationInSeconds),
            escapeCsv(doc.startedAt),
            escapeCsv(doc.endedAt),
            escapeCsv(todosStr),
            escapeCsv(linkedKind),
            escapeCsv(linkedId),
          ].join(',') + '\n';
        }
      } else {
        yield '| ID | Type | Duration (s) | Started At | Ended At | Todos | Linked Kind | Linked ID |\n';
        yield '| --- | --- | --- | --- | --- | --- | --- | --- |\n';
        for await (const doc of cursor) {
          const todosStr = (doc.todos || [])
            .map((t: any) => `${t.completed ? '[x]' : '[ ]'} ${t.name}`)
            .join('; ');
          const linkedKind = doc.linkedTo?.kind || '';
          const linkedId = doc.linkedTo?.id || '';

          yield `| ${escapeMd(doc._id)} | ${escapeMd(doc.type)} | ${escapeMd(doc.durationInSeconds)} | ${escapeMd(doc.startedAt)} | ${escapeMd(doc.endedAt)} | ${escapeMd(todosStr)} | ${escapeMd(linkedKind)} | ${escapeMd(linkedId)} |\n`;
        }
      }
    }

    const stream = Readable.from(generateRows());

    return { stream, filename, contentType };
  }

  async findOne(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid ID');
    const session = await this.sessionModel.findById(id).exec();
    if (!session || session.userId.toString() !== userId) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  async update(id: string, updateSessionDto: UpdateSessionDto, userId: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid ID');
    const session = await this.sessionModel.findById(id).exec();
    if (!session || session.userId.toString() !== userId) {
      throw new NotFoundException('Session not found');
    }
    Object.assign(session, updateSessionDto);
    return session.save();
  }

  async remove(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid ID');
    const session = await this.sessionModel.findById(id).exec();
    if (!session || session.userId.toString() !== userId) {
      throw new NotFoundException('Session not found');
    }
    return session.deleteOne();
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
    timezone: string,
  ): Promise<SessionCountOverTime[]> {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const results = await this.sessionModel.aggregate([
      { $match: { userId, startedAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$startedAt',
              timezone,
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const today = new Date();
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (13 - i));
      return d.toLocaleDateString('en-CA', { timeZone: timezone });
    });

    const map = Object.fromEntries(results.map((r) => [r._id, r.count]));
    return days.map((date) => ({ date, count: map[date] ?? 0 }));
  }

  private async getLongestStreak(
    userId: string,
    timezone: string,
    type?: SessionType,
  ): Promise<number> {
    const match: Record<string, any> = { userId };
    if (type) match.type = type;

    const days: Array<{ _id: string }> = await this.sessionModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$startedAt',
              timezone,
            },
          },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    if (days.length === 0) return 0;

    const toDayNumber = (s: string) => {
      const [year, month, day] = s.split('-').map(Number);
      return Date.UTC(year, month - 1, day) / 86400000;
    };

    const dates = days.map((d) => d._id);
    let current = 1;
    let longest = 1;

    for (let i = 1; i < dates.length; i++) {
      if (toDayNumber(dates[i - 1]) - toDayNumber(dates[i]) === 1) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }

    return longest;
  }

  private async getCurrentStreak(
    userId: string,
    timezone: string,
    type?: SessionType,
  ): Promise<number> {
    const match: Record<string, any> = { userId };
    if (type) match.type = type;

    const days: Array<{ _id: string }> = await this.sessionModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$startedAt',
              timezone,
            },
          },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    if (days.length === 0) return 0;

    const dates = days.map((d) => d._id);
    const todayStr = new Date().toLocaleDateString('en-CA', {
      timeZone: timezone,
    });
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA', {
      timeZone: timezone,
    });

    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) return 0;

    const toDayNumber = (s: string) => {
      const [year, month, day] = s.split('-').map(Number);
      return Date.UTC(year, month - 1, day) / 86400000;
    };

    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      if (toDayNumber(dates[i - 1]) - toDayNumber(dates[i]) === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  async getStreaks(userId: string, timezone: string) {
    const types = Object.values(SessionType);

    const results = await Promise.all(
      types.map(async (type) => {
        const [currentStreak, longestStreak] = await Promise.all([
          this.getCurrentStreak(userId, timezone, type),
          this.getLongestStreak(userId, timezone, type),
        ]);
        return { type, currentStreak, longestStreak };
      }),
    );

    return results;
  }

  async getStatistics(
    userId: string,
    timezone: string,
  ): Promise<SessionStatistics> {
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
      this.getSessionCountOverTime(userId, timezone),
      this.getCurrentStreak(userId, timezone, undefined),
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
