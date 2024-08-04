import { Controller, Post, Body, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user.dto';
import { Public } from 'src/common/decorators/ispublic.decorator';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) { }
  
  @Public()
  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get('list')
  async userList() {
    return this.userService.list()
  }
  // Add other endpoints as needed
}
