import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Difficulty, DsaPattern, ConfidenceLevel } from '@devlog/types';

export type DsaDocument = HydratedDocument<Dsa>;

@Schema({ timestamps: true, collection: 'dsa' })
export class Dsa {
  @Prop({ required: true })
  problemName!: string;

  @Prop({ required: true })
  problemNumber!: number;

  @Prop({ required: true, enum: Difficulty })
  difficulty!: Difficulty;

  @Prop({ required: true, enum: DsaPattern })
  pattern!: DsaPattern;

  @Prop({ default: false })
  isSolved!: boolean;

  @Prop({ required: true, enum: ConfidenceLevel })
  confidenceLevel!: ConfidenceLevel;

  @Prop()
  notes?: string;
}

export const DsaSchema = SchemaFactory.createForClass(Dsa);
