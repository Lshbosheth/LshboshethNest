// src/logger.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  // 创建快捷方法，方便调用
  log(message: string, context?: any, meta?: any) {
    this.logger.info(message, context, meta);
  }

  error(message: string, error?: Error, context?: any, meta?: any) {
    // 注意：winston 的 error 方法签名是 log(level, message, meta)
    // 通常把 error 对象作为 meta 的一部分
    this.logger.error(
      message,
      { ...meta, error, stack: error?.stack },
      context,
    );
  }

  warn(message: string, context?: any, meta?: any) {
    this.logger.warn(message, context, meta);
  }

  info(message: string, context?: any, meta?: any) {
    this.logger.info(message, context, meta);
  }

  debug(message: string, context?: any, meta?: any) {
    this.logger.debug(message, context, meta);
  }
}
