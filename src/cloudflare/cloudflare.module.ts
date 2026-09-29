import { Module } from '@nestjs/common';
import { CloudflareService } from './cloudflare.service';
import { CloudflareController } from './cloudflare.controller';
import { CloudflareBridgeGuard } from './cloudflare-bridge.guard';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [CloudflareController],
  providers: [CloudflareService, CloudflareBridgeGuard],
  exports: [CloudflareService],
})
export class CloudflareModule {}
