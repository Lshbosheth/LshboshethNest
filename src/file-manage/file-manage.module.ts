import { Module } from '@nestjs/common';
import { FileManageService } from './file-manage.service';
import { FileManageController } from './file-manage.controller';
import { UtilsModule } from '../utils/utils.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Files } from '../upload/entities/upload.entity';
@Module({
  imports: [UtilsModule, TypeOrmModule.forFeature([Files])],
  controllers: [FileManageController],
  providers: [FileManageService],
})
export class FileManageModule {}
