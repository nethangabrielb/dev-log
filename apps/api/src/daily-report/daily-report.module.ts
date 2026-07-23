import { Module } from '@nestjs/common';
import { DailyReportService } from './daily-report.service';
import { DailyReportController } from './daily-report.controller';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from '../sessions/schemas/sessions.schema';
import { User, UserSchema } from '../users/schemas/users.schema';
import { DailyReport, DailyReportSchema } from './schema/daily-report.schema';
import { DailyReportProcessor } from './daily-report.processor';
import { DailyReportScheduler } from './daily-report.scheduler';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'daily-report' }),
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: User.name, schema: UserSchema },
      { name: DailyReport.name, schema: DailyReportSchema },
    ]),
  ],
  providers: [DailyReportService, DailyReportScheduler, DailyReportProcessor],
  controllers: [DailyReportController],
})
export class DailyReportModule {}
