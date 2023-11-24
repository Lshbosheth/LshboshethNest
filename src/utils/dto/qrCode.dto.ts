import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class QrCodeDto {
  @IsNotEmpty()
  @ApiProperty({
    example:
      'https://juejin.cn/post/6859199920784703496?searchId=2023112409585644919DDE7F9EAE611B0F',
    description: '网址',
  })
  text: string;
}
