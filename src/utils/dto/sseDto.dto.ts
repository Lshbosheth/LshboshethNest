import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class sseDto {
  @IsNotEmpty({ message: '问题不能是空' })
  @IsString()
  @ApiProperty({
    example: '9.9和9.11谁大',
    description: '问题',
  })
  question: string;
}
