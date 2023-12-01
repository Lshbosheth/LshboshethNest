import { Module } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { UtilsController } from './utils.controller';
import { UploadModule } from '../upload/upload.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Config } from './entities/config.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Config]), UploadModule],
  providers: [UtilsService],
  controllers: [UtilsController],
})
export class UtilsModule {}
