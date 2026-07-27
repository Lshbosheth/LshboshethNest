import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LocalOssUploadDto {
  @ApiPropertyOptional({
    description: '文件名，不需要带 .html。非英文会自动降级为 page-时间-随机码',
    example: 'my-demo-page',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'HTML 字符串。使用 multipart/form-data 上传 file 时可不传',
    example: '<!doctype html><html><body>Hello</body></html>',
  })
  @IsOptional()
  @IsString()
  html?: string;
}

export class LocalOssMultipartUploadDto {
  @ApiPropertyOptional({
    description: '文件名，不需要带 .html。非英文会自动降级为 page-时间-随机码',
    example: 'my-demo-page',
  })
  name?: string;

  @ApiProperty({
    description: 'HTML 文件',
    type: 'string',
    format: 'binary',
  })
  file: any;
}
