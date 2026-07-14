import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Model, Types } from 'mongoose';
import { Article } from './schema/articles.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
  ReadRatio,
  TotalTimeSpentReading,
  ArticleStatus,
  BreakdownByCategory,
} from '@devlog/types';
import { Session } from '../sessions/entities/session.entity';
import { SessionType } from '@devlog/types';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
  ) {}

  async create(createArticleDto: CreateArticleDto, userId: string) {
    return this.articleModel.create({ ...createArticleDto, userId });
  }

  async findAll(userId: string) {
    return this.articleModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }
    const article = await this.articleModel.findById(id).exec();
    if (!article || article.userId !== userId) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async update(id: string, updateArticleDto: UpdateArticleDto, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }
    const article = await this.articleModel.findById(id).exec();
    if (!article || article.userId !== userId) {
      throw new NotFoundException('Article not found');
    }
    Object.assign(article, updateArticleDto);
    if (article.status === ArticleStatus.READ) {
      article.readAt ??= new Date();
    } else {
      article.readAt = undefined;
    }
    return article.save();
  }

  async remove(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID');
    }
    const article = await this.articleModel.findById(id).exec();
    if (!article || article.userId !== userId) {
      throw new NotFoundException('Article not found');
    }
    return article.deleteOne();
  }

  // STATISTICS
  async getReadRatio(userId: string): Promise<ReadRatio> {
    const result = await this.articleModel.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          read: {
            $sum: {
              $cond: [{ $eq: ['$status', ArticleStatus.READ] }, 1, 0],
            },
          },
        },
      },
      { $project: { _id: 0, total: 1, read: 1 } },
    ]);

    return result[0] ?? { total: 0, read: 0 };
  }

  async getReadThisMonth(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const results = await this.articleModel.aggregate([
      {
        $match: {
          userId,
          status: ArticleStatus.READ,
          readAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$readAt',
              timezone: 'Asia/Manila',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const daysInMonth = endOfMonth.getDate();

    // build an array of all the days of the current month
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), i + 1);
      return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
    });

    const map = Object.fromEntries(results.map((r) => [r._id, r.count]));
    return days.map((date) => ({ date, count: map[date] ?? 0 }));
  }

  async getTotalTimeSpentReading(
    userId: string,
  ): Promise<TotalTimeSpentReading> {
    const timeSpent = await this.sessionModel.aggregate([
      { $match: { userId, type: SessionType.ARTICLE } },
      {
        $group: { _id: null, totalDuration: { $sum: '$durationInSeconds' } },
      },
      {
        $project: { _id: 0, totalDuration: 1 },
      },
    ]);

    return timeSpent[0] ?? { totalDuration: 0 };
  }

  async getBreakdownByCategory(userId: string): Promise<BreakdownByCategory[]> {
    const breakdown = await this.articleModel.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, category: '$_id', count: 1 } },
    ]);

    return breakdown as BreakdownByCategory[];
  }

  async getStatistics(userId: string) {
    const [
      readRatio,
      readThisMonth,
      totalTimeSpentReading,
      breakdownByCategory,
    ] = await Promise.all([
      this.getReadRatio(userId),
      this.getReadThisMonth(userId),
      this.getTotalTimeSpentReading(userId),
      this.getBreakdownByCategory(userId),
    ]);

    return {
      readRatio,
      readThisMonth,
      totalTimeSpentReading,
      breakdownByCategory,
    };
  }
}
