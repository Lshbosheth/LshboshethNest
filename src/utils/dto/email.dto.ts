import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailDto {
  @IsNotEmpty({ message: '目标邮箱不能为空' })
  @IsString()
  @ApiProperty({
    example: 'lpyr@outlook.com',
    description: '目标邮箱',
  })
  destinationEmail: string;

  @IsString()
  @ApiProperty({
    example: '这是主题',
    description: '主题',
  })
  subject?: string;

  @IsString()
  @ApiProperty({
    example: '01',
    description: '邮件htmlCode',
  })
  htmlCode?: string;
}
