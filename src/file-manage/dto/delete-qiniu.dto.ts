import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DeleteQiniuDto {
  @IsNotEmpty()
  @ApiProperty({
    example: '["123"]',
    description: '删除的文件nameList',
  })
  names: [];
}
