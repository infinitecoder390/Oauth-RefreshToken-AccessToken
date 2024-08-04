import { Module } from '@nestjs/common';
import { AuthtokensService } from './authtokens.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuthAccessToken,
  AuthAccessTokenSchema,
} from './schema/auth_access_token.schema';
import {
  AuthRefreshToken,
  AuthRefreshTokenSchema,
} from './schema/auth_refresh_token.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuthAccessToken.name, schema: AuthAccessTokenSchema },
      { name: AuthRefreshToken.name, schema: AuthRefreshTokenSchema },
    ]),
  ],
  providers: [AuthtokensService],
  exports:[AuthtokensService]
})
export class AuthtokensModule {}
