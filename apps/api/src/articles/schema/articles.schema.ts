import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ArticleCategory, ArticleStatus } from '@devlog/types';

export type ArticleDocument = HydratedDocument<Article>;

@Schema({ timestamps: true })
export class Article {
  @Prop({ required: true })
  url!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, type: String, enum: ArticleCategory })
  category!: ArticleCategory;

  @Prop({ required: false })
  readAt?: Date;

  @Prop({ required: false, type: [String] })
  tags?: string[];

  @Prop({
    required: false,
    type: String,
    enum: ArticleStatus,
    default: ArticleStatus.UNREAD,
  })
  status?: ArticleStatus;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
