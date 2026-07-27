import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { generateDocument } from './swagger';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './global/interceptor/transform/transform.interceptor';
import { HttpExceptionFilter } from './global/filter/http-exception/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import compression from 'compression';
import { createLocalOssPublicMiddleware } from './local-oss/local-oss-public.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*',
  });
  app.use(compression());
  app.use(createLocalOssPublicMiddleware());
  app.useStaticAssets('public');
  const appLogger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(appLogger);
  generateDocument(app);
  const port = +process.env.SERVICE_PORT;
  await app.listen(port, () => {
    appLogger.log(
      'info',
      `服务启动成功，运行在 http://localhost:${port}/api/swagger`,
      { context: 'Bootstrap' }, // 可选的元数据
    );
  });
}
bootstrap();
