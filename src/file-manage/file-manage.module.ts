import { Module } from '@nestjs/common';
import { FileManageService } from './file-manage.service';
import { FileManageController } from './file-manage.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Files } from './entities/file.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Files])],
  controllers: [FileManageController],
  providers: [FileManageService],
})
export class FileManageModule {}
