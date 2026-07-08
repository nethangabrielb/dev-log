import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session } from './schemas/sessions.schema';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
  ) {}

  // CRUD operations for sessions
  async create(createSessionDto: CreateSessionDto) {
    const createdSession = new this.sessionModel(createSessionDto);
    return createdSession.save();
  }

  async findAll() {
    return this.sessionModel.find().exec();
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
  private async getTotalByType(userId: string) {
    return this.sessionModel.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: { _id: '$type', totalDuration: { $sum: '$durationInSeconds' } },
      },
      { $sort: { totalDuration: -1 } },
    ]);
  }
  private async getAveragePerDay(userId: string) {}
  private async getMostProductiveDay(userId: string) {}
  private async getTotalTimeSpent(userId: string) {}
  private async getTotalSessions(userId: string) {}
  private async getSessionCountOverTime(userId: string) {}
  private async getCurrentStreak(userId: string) {}

  async getStatistics(userId: string) {
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
