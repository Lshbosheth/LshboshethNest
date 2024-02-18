import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class EditQiniuDto {
  @IsNotEmpty()
  @ApiProperty({
    description: '源文件，需要经过 Base64 编码',
  })
  srcKey: '';
  @IsNotEmpty()
  @ApiProperty({
    description: '目标文件，需要经过 Base64 编码',
  })
  destKey: '';
}
