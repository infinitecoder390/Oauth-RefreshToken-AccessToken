import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { IExistingUser, LoginDto } from './dto/auth.dto';
import { AuthtokensService } from '../authtokens/authtokens.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  IAuthAccessToken,
  IAuthRefreshToken,
} from '../authtokens/interface/auth-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userservice: UserService,
    private readonly authtokenservice: AuthtokensService,
    private readonly configservice: ConfigService,
    private readonly jwtservice: JwtService,
  ) {}
  async login(dto: LoginDto) {
    const isUserExist: IExistingUser = await this.userservice.findOne(
      dto.email,
    );
    if (!isUserExist)
      throw new BadRequestException('Incorrect email or password.');
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      isUserExist.password,
    );
    if (!isPasswordValid)
      throw new BadRequestException('Incorrect email or password.');
    const refreshToken = await this.generateRefreshToken(isUserExist._id);
    const accessToken = await this.generateAccessToken(
      isUserExist._id,
      refreshToken._id,
    );
    return this.generateJwtToken(accessToken, refreshToken);
  }
  async generateAccessToken(isUserExistId: string, refreshTokenId: string) {
    if (!isUserExistId) throw new BadRequestException('User not found');
    if (!refreshTokenId)
      throw new BadRequestException('Refresh token not created');
    const accessTokenExpiresAt =
      Date.now() +
      Number(this.configservice.get<Number>('ACCESS_TOKEN_EXPIRY'));
    return await this.authtokenservice.createAccessToken(
      refreshTokenId,
      isUserExistId,
      accessTokenExpiresAt,
    );
  }
  async generateRefreshToken(isUserExistId: string) {
    if (!isUserExistId) throw new BadRequestException('User not found');
    const refreshTokenExpiryAt =
      Date.now() +
      Number(this.configservice.get<Number>('REFRESH_TOKEN_EXPIRY'));
    return await this.authtokenservice.createRefreshToken(
      isUserExistId,
      refreshTokenExpiryAt,
    );
  }
  async generateJwtToken(
    accessToken: IAuthAccessToken,
    refreshToken: IAuthRefreshToken,
  ) {
    if (!accessToken)
      throw new BadRequestException('Unble to create access token');
    if (!refreshToken)
      throw new BadRequestException('Unble to create refresh token');
    const accessTokenPayload = {
      sub: accessToken.userId,
      jti: accessToken._id,
      tokenType: 'access',
    };
    const refreshTokenPayload = {
      sub: refreshToken.userId,
      jti: refreshToken._id,
      tokenType: 'refresh',
    };
    const [at, rt] = await Promise.all([
      this.jwtservice.signAsync(accessTokenPayload, {
        secret: this.configservice.get('ACCESS_TOKEN_SECRET'),
        expiresIn: Number(this.configservice.get('ACCESS_TOKEN_EXPIRY')),
      }),
      this.jwtservice.signAsync(refreshTokenPayload, {
        secret: this.configservice.get('REFRESH_TOKEN_SECRET'),
        expiresIn: Number(this.configservice.get('REFRESH_TOKEN_EXPIRY')),
      }),
    ]);
    return {
      message: 'User logged in successfully',
      accessToken: at,
      refreshToken: rt,
    };
  }
  async createAtusingRt(refreshToken: string) {
    // check refreshToken there or not
    if (!refreshToken)
      throw new BadRequestException('Refresh token not found.');
    // decode refresh token
    const decodedRefreshToken = await this.jwtservice.verify(refreshToken, {
      secret: this.configservice.get('REFRESH_TOKEN_SECRET'),
    });
    // decode refresh token details by id
    const refreshTokenDetails =
      await this.authtokenservice.findRefreshTokenById(decodedRefreshToken.jti);
    if (!refreshTokenDetails || !refreshTokenDetails.isValid)
      throw new UnauthorizedException('Invalid refresh token.');
    // delete old accesstoken by refresh token
    await this.authtokenservice.deleteAccessTokenByRefreshTokenId(
      refreshTokenDetails._id,
    );
    // update refresh token lastUpdateAt (Invalidate refresh token to next use)
    await this.authtokenservice.updateRefreshTokenById(
      refreshTokenDetails._id,
      { lastUsedAt: Date.now(), isValid: false },
    );
    // create new refresh token record
    const createNewRefreshToken = await this.generateRefreshToken(
      decodedRefreshToken.sub,
    );
    // prepare new access token record
    const createNewAccessToken = await this.generateAccessToken(
      decodedRefreshToken.sub,
      createNewRefreshToken._id,
    );

    // get new jwt refresh token and access token
    const newAccessTokenAndRefreshToken = await this.generateJwtToken(
      createNewAccessToken,
      createNewRefreshToken,
    );
    newAccessTokenAndRefreshToken['message'] =
      'New access token and refresh token fetched successfully.';
    return newAccessTokenAndRefreshToken;
  }
  async signOut(accessToken: string) {
    if (!accessToken) {
      throw new BadRequestException('Invalid access Token.');
    }
    const decodedAccessToken = await this.jwtservice.verify(accessToken, {
      secret: this.configservice.get('ACCESS_TOKEN_SECRET'),
    });
    await this.eraseUserSession(decodedAccessToken.sub);
    return { message: 'User logged out successfully' };
  }
  async eraseUserSession(userId: string) {
    if (!userId) throw new BadRequestException('Unable to erase session');
    await this.authtokenservice.deleteAllRefreshTokenByUserId(userId);
    await this.authtokenservice.deleteAllAccessTokenByUserId(userId);
  }
  async validateAccessTokenRequest(refreshToken: IAuthRefreshToken) {
    if (!refreshToken) {
      throw new BadRequestException('Unable to validate refresh token.');
    }
    const accessTokenExpiry =
      Number(this.configservice.get('ACCESS_TOKEN_EXPIRY')) * 1000;
    if (
      refreshToken.lastUsedAt &&
      new Date(refreshToken.lastUsedAt).getTime() + accessTokenExpiry >
        Date.now()
    ) {
      throw new BadRequestException(
        'Cannot generate access token too frequently.',
      );
    }
  }
}
