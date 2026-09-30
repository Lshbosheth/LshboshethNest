import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CloudflareService } from './cloudflare.service';
import { CloudflareBridgeGuard } from './cloudflare-bridge.guard';

@ApiTags('Cloudflare 缓存管理')
@Controller('cloudflare/cache')
@UseGuards(CloudflareBridgeGuard)
export class CloudflareCacheController {
  constructor(private readonly cloudflareService: CloudflareService) {}

  @Post('purge')
  @ApiOperation({ summary: '清空整站缓存（purge_everything），供 MCP 桥调用' })
  purgeCache() {
    return this.cloudflareService.purgeCache();
  }
}
