import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true, unique: true })
  username!: string;

  @Prop({ select: false })
  password?: string;

  @Prop({ type: String })
  timezone?: string;

  @Prop({ type: String, enum: ['local', 'google'], default: 'local' })
  provider!: string;

  @Prop()
  googleId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
