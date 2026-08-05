import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/users.schema';
import { CreateUserDto } from './dto/users.dto';

// Internal record type: provider/googleId are set server-side only
// (never accepted from the client — see CreateUserDto).
export type CreateUserRecord = CreateUserDto & {
  provider?: 'local' | 'google';
  googleId?: string;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserRecord) {
    if (createUserDto.email) {
      createUserDto.email = createUserDto.email.trim().toLowerCase();
    }
    return this.userModel.create(createUserDto);
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
    return this.userModel.updateOne({ _id: userId }, { $set: { timezone } });
  }
}
