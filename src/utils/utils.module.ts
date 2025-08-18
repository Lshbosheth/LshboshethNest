import { Module } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { LoggerService} from '../logger.service';
import { UtilsController } from './utils.controller';
import { FileManageModule } from '../file-manage/file-manage.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from './entities/config.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Config]), FileManageModule],
  providers: [UtilsService, LoggerService],
  controllers: [UtilsController],
  exports: [UtilsService, LoggerService],
})
export class UtilsModule {}
