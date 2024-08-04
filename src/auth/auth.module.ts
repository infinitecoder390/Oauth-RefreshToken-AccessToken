import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { AuthtokensModule } from 'src/authtokens/authtokens.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [UserModule, AuthtokensModule, JwtModule],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
