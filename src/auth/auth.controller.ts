import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ApiOperation } from '@nestjs/swagger';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @ApiOperation({
    summary: '登录',
  })
  login(@Body() AuthDto: CreateAuthDto) {
    return this.authService.login(AuthDto);
  }
}
