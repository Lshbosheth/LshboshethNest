import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private user: Repository<User>,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  async login(loginData: CreateAuthDto) {
    const findUser = await this.user.findOne({
      where: { username: loginData.username },
    });
    if (!findUser) return '用户不存在!';
    const compareRes: boolean = bcryptjs.compareSync(
      loginData.password,
      findUser.password,
    );
    if (!compareRes) return '密码不正确';
    const tokens = await this.getTokens(findUser.id, findUser.username);
    await this.updateRefreshToken(findUser.id, tokens.refreshToken);
    return {
      message: '登录成功',
      ...tokens,
    };
  }

  async signUp(signUpData: CreateAuthDto) {
    const findUser = await this.user.findOne({
      where: { username: signUpData.username },
    });
    if (findUser && findUser.username == signUpData.username) {
      return '该用户已注册';
    }
    signUpData.password = bcryptjs.hashSync(signUpData.password, 10);
    const newUser = await this.user.save(signUpData);
    const tokens = await this.getTokens(newUser.id, newUser.username);
    console.log(tokens);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);
    return {
      message: '注册成功',
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.userService.update(userId, { refreshToken: null });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const findUser = await this.user.findOne({
      where: { id: userId },
    });
    if (!findUser || !findUser.refreshToken) return '请重新登录';
    if (findUser.refreshToken !== refreshToken) return '请重新登录';
    const tokens = await this.getTokens(findUser.id, findUser.username);
    await this.updateRefreshToken(findUser.id, tokens.refreshToken);
    return tokens;
  }

  async getTokens(userId: string, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '60s',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    await this.userService.update(userId, {
      refreshToken: refreshToken,
    });
  }
}
