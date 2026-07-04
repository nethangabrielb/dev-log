import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session } from './schemas/sessions.schema';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<Session>,
  ) {}

  async create(createSessionDto: CreateSessionDto) {
    const createdSession = new this.sessionModel(createSessionDto);
    return createdSession.save();
  }

  async findAll() {
    return this.sessionModel.find().exec();
  }

  findOne(id: string) {
    return this.sessionModel.findById(id).exec();
  }

  update(id: string, updateSessionDto: UpdateSessionDto) {
    return this.sessionModel
      .findByIdAndUpdate(id, updateSessionDto, { new: true })
      .exec();
  }

  remove(id: string) {
    return this.sessionModel.findByIdAndDelete(id).exec();
  }
}
