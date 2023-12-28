import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';

@ApiTags('用户模块')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post()
  // @ApiOperation({
  //   summary: '添加用户',
  // })
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({
    summary: '查找所有用户',
  })
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({
    summary: '查找单个用户',
  })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({
    summary: '修改单个用户',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({
    summary: '删除单个用户',
  })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
