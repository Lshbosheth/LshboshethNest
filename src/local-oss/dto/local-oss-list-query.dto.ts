import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LocalOssListQueryDto {
  @ApiPropertyOptional({
    description: '按路径前缀筛选',
    example: 'demo',
  })
  @IsOptional()
  @IsString()
  prefix?: string;
}
