import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/public.decorator';

@ApiTags('登录鉴权')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('/login')
  @ApiOperation({
    summary: '登录',
  })
  login(@Body() AuthDto: CreateAuthDto) {
    return this.authService.login(AuthDto);
  }

  @Public()
  @Post('/signUp')
  @ApiOperation({
    summary: '注册',
  })
  signUp(@Body() AuthDto: CreateAuthDto) {
    return this.authService.signUp(AuthDto);
  }
}
