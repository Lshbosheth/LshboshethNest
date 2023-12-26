import { Body, Controller, Post, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RefreshTokenGuard } from '../common/guards/refreshToken.guard';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';
import { Request } from 'express';

@ApiTags('登录鉴权')
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

  @Post('/signUp')
  @ApiOperation({
    summary: '注册',
  })
  signUp(@Body() AuthDto: CreateAuthDto) {
    return this.authService.signUp(AuthDto);
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  @ApiOperation({
    summary: '登出',
  })
  logout(@Req() req: Request) {
    this.authService.logout(req.user['sub']);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  @ApiOperation({
    summary: '刷新token',
  })
  refreshTokens(@Req() req: Request) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
