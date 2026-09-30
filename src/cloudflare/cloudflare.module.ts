import { Module } from '@nestjs/common';
import { CloudflareService } from './cloudflare.service';
import { CloudflareController } from './cloudflare.controller';
import { CloudflareCacheController } from './cloudflare-cache.controller';
import { CloudflareBridgeGuard } from './cloudflare-bridge.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [CloudflareController, CloudflareCacheController],
  providers: [CloudflareService, CloudflareBridgeGuard],
  exports: [CloudflareService],
})
export class CloudflareModule {}
