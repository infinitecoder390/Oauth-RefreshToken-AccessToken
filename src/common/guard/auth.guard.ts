import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/ispublic.decorator';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const req = context.switchToHttp().getRequest();
    const authorizationHeader = req.headers['authorization'];
    if (isPublic) {
      return true;
    }
    if (!authorizationHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }
    const token = authorizationHeader.split(' ')[1];
    try {
      if (!token) {
        throw new UnauthorizedException('Invalid access token');
      }
      const decodedAccessToken = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      });
      req.userId = decodedAccessToken.sub;
      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
