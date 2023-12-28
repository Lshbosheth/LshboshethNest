import { PartialType } from '@nestjs/swagger';
import { CreateFileManageDto } from './create-file-manage.dto';

export class UpdateFileManageDto extends PartialType(CreateFileManageDto) {}
