import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @ApiProperty({
    example: '小明',
    description: '用户名',
  })
  username: string;
  @IsNotEmpty()
  @ApiProperty({
    example: 'test123',
    description: '密码',
  })
  password: string;
  refreshToken?: string;
}
