import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private user: Repository<User>) {}
  async create(createUserDto: CreateUserDto) {
    const user = new User();
    user.username = createUserDto.username;
    user.password = createUserDto.password;
    return await this.user.save(user);
  }

  async findAll() {
    return this.user.find();
  }

  async findOne(id: string) {
    return await this.user.findOne({ where: { id } });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.user.update(id, updateUserDto);
  }

  async remove(id: string) {
    return await this.user.delete(id);
  }
}
