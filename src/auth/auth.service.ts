import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private user: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async login(loginData: CreateAuthDto) {
    const findUser = await this.user.findOne({
      where: { username: loginData.username },
    });
    if (!findUser) return '用户不存在!';
    const comparRes: boolean = bcryptjs.compareSync(
      loginData.password,
      findUser.password,
    );
    if (!comparRes) return '密码不正确';
    const payload = { username: findUser.username };
    return {
      accessToken: this.jwtService.sign(payload),
      message: '登录成功',
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
    return await this.user.save(signUpData);
  }
}
