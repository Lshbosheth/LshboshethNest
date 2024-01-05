import { PartialType } from '@nestjs/swagger';
import { CreateQiniuDto } from './create-qiniu.dto';

export class UpdateQiniuDto extends PartialType(CreateQiniuDto) {}
