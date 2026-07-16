import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DailyReportDocument = HydratedDocument<DailyReport>;

@Schema({ timestamps: true })
export class DailyReport {
  @Prop({ type: String, required: true })
  userId!: string;

  @Prop({ required: true })
  date!: string;

  @Prop({ required: true })
  totalTimeLogged!: number;

  @Prop({ required: true })
  totalTasksCompleted!: number;

  @Prop({ required: true })
  topSessionType!: string;

  @Prop({
    type: [
      {
        type: { type: String, required: true },
        durationInSeconds: { type: Number, required: true },
        tasksCompleted: { type: Number, required: true },
      },
    ],
    required: true,
  })
  breakdownBySessionType!: Array<{
    type: string;
    durationInSeconds: number;
    tasksCompleted: number;
  }>;

  @Prop({ default: false })
  isRead!: boolean;
}

export const DailyReportSchema = SchemaFactory.createForClass(DailyReport);
DailyReportSchema.index({ userId: 1, date: 1 }, { unique: true });
