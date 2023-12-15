import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  login(data: CreateAuthDto) {
    console.log(data);
  }
}
