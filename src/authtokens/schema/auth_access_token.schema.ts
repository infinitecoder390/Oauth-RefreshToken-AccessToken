import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AccessTokenDocument = AuthAccessToken & Document;

@Schema({ collection: 'auth_access_token', timestamps: true })
export class AuthAccessToken {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'AuthRefreshToken',
    required: true,
  })
  refreshTokenId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  accessTokenExpiresAt: number;
}

export const AuthAccessTokenSchema =
  SchemaFactory.createForClass(AuthAccessToken);
