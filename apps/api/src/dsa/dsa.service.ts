import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDsaDto } from './dto/create-dsa.dto';
import { UpdateDsaDto } from './dto/update-dsa.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Dsa } from './entities/dsa.entity';
import { Model, Types } from 'mongoose';
import { DsaDocument } from './schemas/dsa.schema';
import {
  DsaStatistics,
  BreakdownByDifficulty,
  BreakdownByPattern,
  ProblemSolvedOverTime,
} from '@devlog/types';

@Injectable()
export class DsaService {
  constructor(@InjectModel(Dsa.name) private dsaModel: Model<DsaDocument>) {}

  // CRUD for DSA
  async create(createDsaDto: CreateDsaDto, userId: string) {
    return this.dsaModel.create({ ...createDsaDto, userId });
  }

  async findAll(userId: string) {
    return this.dsaModel.find({ userId }).exec();
  }

  async findOne(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid ID');
    const dsa = await this.dsaModel.findById(id).exec();
    if (!dsa || dsa.userId.toString() !== userId) {
      throw new NotFoundException('DSA not found');
    }
    return dsa;
  }

  async update(id: string, updateDsaDto: UpdateDsaDto, userId: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid ID');
    const dsa = await this.dsaModel.findById(id).exec();
    if (!dsa || dsa.userId.toString() !== userId) {
      throw new NotFoundException('DSA not found');
    }
    Object.assign(dsa, updateDsaDto);
    return dsa.save();
  }

  async remove(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid ID');
    const dsa = await this.dsaModel.findById(id).exec();
    if (!dsa || dsa.userId.toString() !== userId) {
      throw new NotFoundException('DSA not found');
    }
    return dsa.deleteOne();
  }

  // STATISTICS
  private async getTotalProblemsSolved(userId: string): Promise<number> {
    return this.dsaModel.countDocuments({ userId, isSolved: true }).exec();
  }

  private async getCurrentStreak(userId: string): Promise<number> {
    const result: Array<{ _id: string }> = await this.dsaModel.aggregate([
      { $match: { userId, isSolved: true } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$solvedAt',
              timezone: 'Asia/Manila',
            },
          },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const days = result.map((r) => r._id);

    if (days.length === 0) return 0;

    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Manila',
    });
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString(
      'en-CA',
      { timeZone: 'Asia/Manila' },
    );

    if (days[0] !== today && days[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1]);
      const curr = new Date(days[i]);
      const diffDays =
        (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private async getLongestStreak(userId: string): Promise<number> {
    const result: Array<{ _id: string }> = await this.dsaModel.aggregate([
      { $match: { userId, isSolved: true } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$solvedAt',
              timezone: 'Asia/Manila',
            },
          },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const days = result.map((r) => r._id);

    if (days.length === 0) return 0;

    let longest = 1;
    let current = 1;

    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1]);
      const curr = new Date(days[i]);
      const diffDays =
        (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        current++;
        if (current > longest) longest = current;
      } else {
        current = 1;
      }
    }

    return longest;
  }

  private async getBreakdownByDifficulty(
    userId: string,
  ): Promise<BreakdownByDifficulty[]> {
    const res = await this.dsaModel
      .aggregate([
        { $match: { userId } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      ])
      .exec();

    return res as BreakdownByDifficulty[];
  }

  private async getBreakdownByPattern(
    userId: string,
  ): Promise<BreakdownByPattern[]> {
    const res = await this.dsaModel
      .aggregate([
        { $match: { userId } },
        { $group: { _id: '$pattern', count: { $sum: 1 } } },
      ])
      .exec();
    return res as BreakdownByPattern[];
  }

  private async getProblemsSolvedOverTime(
    userId: string,
  ): Promise<ProblemSolvedOverTime[]> {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const res = await this.dsaModel
      .aggregate([
        {
          $match: {
            userId,
            solvedAt: { $gte: fourteenDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$solvedAt',
                timezone: 'Asia/Manila',
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .exec();

    return res as ProblemSolvedOverTime[];
  }

  async getStatistics(userId: string): Promise<DsaStatistics> {
    const [
      totalProblemsSolved,
      currentStreak,
      longestStreak,
      breakdownByDifficulty,
      breakdownByPattern,
      problemsSolvedOverTime,
    ] = await Promise.all([
      this.getTotalProblemsSolved(userId),
      this.getCurrentStreak(userId),
      this.getLongestStreak(userId),
      this.getBreakdownByDifficulty(userId),
      this.getBreakdownByPattern(userId),
      this.getProblemsSolvedOverTime(userId),
    ]);

    return {
      totalProblemsSolved,
      currentStreak,
      longestStreak,
      breakdownByDifficulty,
      breakdownByPattern,
      problemsSolvedOverTime,
    };
  }
}
