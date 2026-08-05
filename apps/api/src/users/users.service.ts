import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/users.schema';
import { CreateUserDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return this.userModel.create(createUserDto);
  }

  async findByIdentifier(identifier: string) {
    return this.userModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
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
