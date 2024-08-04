import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
import { Public } from 'src/common/decorators/ispublic.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authservice: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authservice.login(dto);
  }

  @Public()
  @Post('refresh')
  async usingRefreshTokenCreateNewAccessToken(
    @Body() dto: { refreshToken: string },
  ) {
    return await this.authservice.createAtusingRt(dto.refreshToken);
  }
  @Public()
  @Post('logout')
  async logout(@Body() dto: { accessToken: string }) {
    return await this.authservice.signOut(dto.accessToken);
  }
}
