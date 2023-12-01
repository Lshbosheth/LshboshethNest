// update-config.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConfigDto {
    @IsNotEmpty({ message: '配置名不能为空' })
    @IsString()
    @ApiProperty({
        example: 'info',
        description: '配置名',
    })
    configName: string;

    @IsNotEmpty({ message: '配置值不能为空' })
    @IsString()
    @ApiProperty({
        example: 'newValue',
        description: '配置值',
    })
    configValue: string;
}
