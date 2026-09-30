import { Controller, Get } from '@nestjs/common';
import * as os from 'node:os';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health() {
    const total = os.totalmem();
    const free = os.freemem();
    return {
      ok: true,
      service: 'lshbosheth-nest',
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.round(os.uptime()),
      process_uptime_seconds: Math.round(process.uptime()),
      memory: {
        total_bytes: total,
        free_bytes: free,
        usage_percent: Math.round(((total - free) / total) * 1000) / 10,
        rss_bytes: process.memoryUsage().rss,
      },
      load_average: os.loadavg().map((value) => Math.round(value * 100) / 100),
      node_version: process.version,
    };
  }
}
