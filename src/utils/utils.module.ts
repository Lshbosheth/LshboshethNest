import { Module } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { UtilsController } from './utils.controller';
import { UploadModule } from '../upload/upload.module';
@Module({
  imports: [UploadModule],
  providers: [UtilsService],
  controllers: [UtilsController],
})
export class UtilsModule {}
