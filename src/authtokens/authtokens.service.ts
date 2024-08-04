import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  AccessTokenDocument,
  AuthAccessToken,
} from './schema/auth_access_token.schema';
import { Model } from 'mongoose';
import {
  AuthRefreshToken,
  AuthRefreshTokenDocument,
} from './schema/auth_refresh_token.schema';
import {
  IAuthAccessToken,
  IAuthRefreshToken,
} from './interface/auth-token.dto';

@Injectable()
export class AuthtokensService {
  constructor(
    @InjectModel(AuthAccessToken.name)
    private accessTokenModel: Model<AccessTokenDocument>,
    @InjectModel(AuthRefreshToken.name)
    private accessRefreshModel: Model<AuthRefreshTokenDocument>,
  ) {}

  // refresh token apis

  async createRefreshToken(
    userId: string,
    expiresAt: number,
  ): Promise<IAuthRefreshToken> {
    const refreshToken = new this.accessRefreshModel({
      userId,
      refreshTokenExpiresAt: expiresAt,
    });
    const savedToken = await refreshToken.save();
    return {
      _id: savedToken._id.toString(),
      userId: savedToken.userId,
      refreshTokenExpiresAt: savedToken.refreshTokenExpiresAt,
      lastUsedAt: savedToken.lastUsedAt,
      isValid: savedToken.isValid,
    };
  }
  async findRefreshTokenById(_id: string): Promise<IAuthRefreshToken> {
    return this.accessRefreshModel.findOne({ _id });
  }
  async findRefreshTokenByUserId(userId: string): Promise<IAuthRefreshToken> {
    return this.accessRefreshModel.findOne({ userId });
  }
  async updateRefreshTokenById(
    _id: string,
    dto: { lastUsedAt: number; isValid: boolean },
  ) {
    return this.accessRefreshModel.updateOne({ _id }, { ...dto });
  }
  async deleteRefreshTokenByUserId(userId: string): Promise<void> {
    await this.accessRefreshModel.deleteOne({ userId });
  }

  async deleteAllRefreshTokenByUserId(userId: string) {
    await this.accessRefreshModel.deleteMany({ userId });
  }
  // access token  apis
  async createAccessToken(
    refreshTokenId: string,
    userId: string,
    expiresAt: number,
  ): Promise<IAuthAccessToken> {
    const accessToken = new this.accessTokenModel({
      refreshTokenId,
      userId,
      accessTokenExpiresAt: expiresAt,
    });
    const savedToken = await accessToken.save();
    return {
      _id: savedToken._id.toString(),
      userId: savedToken.userId,
      refreshTokenId: savedToken.refreshTokenId,
      accessTokenExpiresAt: savedToken.accessTokenExpiresAt,
    };
  }
  async deleteAccessTokenByRefreshTokenId(
    refreshTokenId: string,
  ): Promise<void> {
    await this.accessTokenModel.deleteOne({ refreshTokenId });
  }
  async deleteAllAccessTokenByUserId(userId: string) {
    await this.accessTokenModel.deleteMany({ userId });
  }
}
