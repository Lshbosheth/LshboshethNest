import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from './constants';

export interface JwtPayload {
  username: string;
}

@Injectable()
export default class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: JwtPayload) {
    // jwt鉴权通过后，会返回鉴权信息，然后将对象设置在req.user上面
    const { username } = payload;
    return {
      username,
    };
  }
}
