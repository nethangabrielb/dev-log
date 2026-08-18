import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/users.schema';
import { DailyReportModule } from '../daily-report/daily-report.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    DailyReportModule,
  ],
  exports: [UsersService],
  providers: [UsersService],
})
export class UsersModule {}
