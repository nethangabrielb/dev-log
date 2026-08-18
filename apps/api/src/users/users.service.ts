import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/users.schema';
import { CreateUserDto } from './dto/users.dto';
import { normalizeTimezone } from '../common/timezone.util';
import { DailyReportScheduler } from '../daily-report/daily-report.scheduler';

// Internal record type: provider/googleId are set server-side only
// (never accepted from the client — see CreateUserDto).
export type CreateUserRecord = CreateUserDto & {
  provider?: 'local' | 'google';
  googleId?: string;
};

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly dailyReportScheduler: DailyReportScheduler,
  ) {}

  async create(createUserDto: CreateUserRecord) {
    if (createUserDto.email) {
      createUserDto.email = createUserDto.email.trim().toLowerCase();
    }
    const user = await this.userModel.create(createUserDto);

    try {
      await this.dailyReportScheduler.upsertUserScheduler(
        user._id.toString(),
        user.timezone,
      );
    } catch (error) {
      this.logger.error(
        `Failed to schedule daily report for new user ${user._id.toString()}:`,
        error,
      );
    }

    return user;
  }

  async findByIdentifier(identifier: string) {
    return this.userModel
      .findOne({
        $or: [
          { email: identifier.trim().toLowerCase() },
          { username: identifier },
        ],
      })
      .select('+password');
  }

  async findByGoogleId(googleId: string) {
    return this.userModel.findOne({ googleId });
  }

  async setGoogleId(userId: string, googleId: string) {
    return this.userModel.updateOne({ _id: userId }, { $set: { googleId } });
  }

  async updateTimezone(userId: string, timezone: string) {
    const normalized = normalizeTimezone(timezone);
    const result = await this.userModel.updateOne(
      { _id: userId },
      { $set: { timezone: normalized } },
    );

    try {
      await this.dailyReportScheduler.upsertUserScheduler(userId, normalized);
    } catch (error) {
      this.logger.error(
        `Failed to update daily report scheduler timezone for user ${userId}:`,
        error,
      );
    }

    return result;
  }
}
