import { Module } from '@nestjs/common';
import { OssAdminController } from './oss-admin.controller';
import { OssAdminService } from './oss-admin.service';
import { LocalOssTokenGuard } from '../local-oss/local-oss-token.guard';

@Module({ controllers: [OssAdminController], providers: [OssAdminService, LocalOssTokenGuard] })
export class OssAdminModule {}
