// update-config.dto.ts
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InfoItem {
  @IsNotEmpty({ message: '配置名不能为空' })
  @IsString()
  @ApiProperty({
    example: 'info',
    description: '配置名',
  })
  configName: string;

  @ApiProperty({
    example: '1',
    description: '配置顺序',
    required: false,
  })
  configSort?: string;

  @ApiProperty({
    example: 'xxx',
    description: '描述',
    required: false,
  })
  description?: string;
}

export class UpdateConfigDto {
  @IsArray()
  @IsNotEmpty({ message: '配置列表不能为空' })
  @ApiProperty({
    type: [InfoItem],
    description: '配置列表',
  })
  infoList: InfoItem[];
}
