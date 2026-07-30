import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn, IsNumber } from 'class-validator';

export class CreateDnsRecordDto {
  @ApiProperty({ description: 'DNS 记录类型', example: 'A', enum: ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV'] })
  @IsString()
  @IsNotEmpty()
  @IsIn(['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV'])
  type: string;

  @ApiProperty({ description: 'DNS 记录名称', example: 'blog' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'DNS 记录内容', example: '192.168.1.1' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'TTL（秒）', example: 3600, required: false })
  @IsOptional()
  @IsNumber()
  ttl?: number;

  @ApiProperty({ description: '是否代理（仅 A/AAAA/CNAME）', example: false, required: false })
  @IsOptional()
  proxied?: boolean;

  @ApiProperty({ description: '优先级（MX 记录）', example: 10, required: false })
  @IsOptional()
  @IsNumber()
  priority?: number;
}
