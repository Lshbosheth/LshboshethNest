import { Module } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { UtilsController } from './utils.controller';
import { FileManageModule } from '../file-manage/file-manage.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from './entities/config.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Config]), FileManageModule],
  providers: [UtilsService],
  controllers: [UtilsController],
  exports: [UtilsService],
})
export class UtilsModule {}
