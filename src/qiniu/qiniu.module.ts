import { Module } from '@nestjs/common';
import { QiniuService } from './qiniu.service';
import { QiniuController } from './qiniu.controller';

@Module({
  controllers: [QiniuController],
  providers: [QiniuService],
})
export class QiniuModule {}
