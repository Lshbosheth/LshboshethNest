import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from '../src/global/interceptor/transform/transform.interceptor';
import { HttpExceptionFilter } from '../src/global/filter/http-exception/http-exception.filter';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { NestExpressApplication } from '@nestjs/platform-express';
import express, { Express } from 'express';
import compression from 'compression';

let cachedApp: Express | null = null;

async function createApp(): Promise<Express> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger: ['error', 'warn'] }, // 只用基础日志
  );

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api');
  app.enableCors({ origin: '*' });
  app.use(compression());

  // Vercel serverless 环境不支持本地文件系统，移除 localOss 中间件

  await app.init();

  cachedApp = expressApp;
  return expressApp;
}

export default async (req: any, res: any) => {
  const app = await createApp();
  app(req, res);
};
