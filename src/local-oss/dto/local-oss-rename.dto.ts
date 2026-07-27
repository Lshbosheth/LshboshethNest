import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LocalOssRenameDto {
  @ApiProperty({
    description: '新的文件名，不需要带 .html',
    example: 'new-demo-name',
  })
  @IsString()
  name: string;
}
