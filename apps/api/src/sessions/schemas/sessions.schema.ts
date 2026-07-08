import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LinkedToKind, SessionType } from '@devlog/types';

export type SessionDocument = HydratedDocument<Session>;

@Schema()
export class Session {
  @Prop({ type: String, enum: SessionType, required: true })
  type!: SessionType;

  @Prop({ type: String, required: true })
  userId!: string;

  @Prop({ required: true })
  durationInSeconds!: number;

  @Prop({ required: true })
  startedAt!: Date;

  @Prop({ required: true })
  endedAt!: Date;

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        completed: { type: Boolean, required: true },
      },
    ],
    required: true,
  })
  todos!: Array<{ name: string; completed: boolean }>;

  @Prop({
    type: {
      kind: { type: String, enum: LinkedToKind, required: true },
      id: { type: String, required: true },
    },
    required: false,
  })
  linkedTo?: { kind: LinkedToKind; id: string };
}

export const SessionSchema = SchemaFactory.createForClass(Session);
