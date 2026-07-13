import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SnippetCategory, SnippetLanguage } from '@devlog/types';

export type SnippetDocument = HydratedDocument<Snippet>;

@Schema({ timestamps: true, collection: 'snippets' })
export class Snippet {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true, type: String, enum: SnippetLanguage })
  language!: SnippetLanguage;

  @Prop({ required: true, type: String, enum: SnippetCategory })
  category!: SnippetCategory;

  @Prop({ type: [String], default: [] })
  tags?: string[];
}

export const SnippetSchema = SchemaFactory.createForClass(Snippet);
