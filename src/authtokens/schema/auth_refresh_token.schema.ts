import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AuthRefreshTokenDocument = AuthRefreshToken & Document;

@Schema({ collection: 'auth_refresh_token', timestamps: true })
export class AuthRefreshToken {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  refreshTokenExpiresAt: number;

  @Prop({})
  lastUsedAt: number;

  @Prop({ default: true })
  isValid: boolean;
}
export const AuthRefreshTokenSchema =
  SchemaFactory.createForClass(AuthRefreshToken);
