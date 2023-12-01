import { IsNotEmpty } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";
export class CreateConfigDto {
  @IsNotEmpty({ message: '配置名不能为空' })
  @ApiProperty({
    example: 'configName',
    description: '配置名',
  })
  configName: string;
  @ApiProperty({
    example: 'configValue',
    description: '配置值',
  })
  configValue?: string;
  @ApiProperty({
    example: 'xxx',
    description: '描述',
  })
  description?: string;
}
