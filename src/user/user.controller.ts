import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../common/public.decorator';
import { Request } from 'express';

@ApiTags('用户模块')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  @ApiOperation({
    summary: '添加用户',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiBearerAuth()
  @Get()
  @ApiOperation({
    summary: '查找所有用户',
  })
  findAll(@Req() req: Request) {
    console.log(req.user);
    return this.userService.findAll();
  }

  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({
    summary: '查找单个用户',
  })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({
    summary: '修改单个用户',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({
    summary: '删除单个用户',
  })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
