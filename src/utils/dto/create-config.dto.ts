import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateConfigDto {
  @IsNotEmpty({ message: '配置名不能为空' })
  @ApiProperty({
    example: 'configName',
    description: '配置名',
  })
  configName: string;
  @ApiProperty({
    example: 'configSort',
    description: '配置顺序',
    required: false,
  })
  configSort?: string;

  @ApiProperty({
    example: 'configType',
    description: '配置类型',
    required: false,
  })
  configType?: string;

  @ApiProperty({
    example: 'xxx',
    description: '描述',
    required: false,
  })
  description?: string;
}
