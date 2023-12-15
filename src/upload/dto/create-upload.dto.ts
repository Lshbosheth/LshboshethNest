import { ApiProperty } from '@nestjs/swagger';

export class CreateUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
