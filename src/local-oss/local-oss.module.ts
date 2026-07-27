import { Module } from '@nestjs/common';
import { LocalOssController } from './local-oss.controller';
import { LocalOssService } from './local-oss.service';
import { LocalOssTokenGuard } from './local-oss-token.guard';

@Module({
  controllers: [LocalOssController],
  providers: [LocalOssService, LocalOssTokenGuard],
  exports: [LocalOssService],
})
export class LocalOssModule {}
