import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { generateDocument } from './swagger';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './global/interceptor/transform/transform.interceptor';
import { HttpExceptionFilter } from './global/filter/http-exception/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';

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
  app.useStaticAssets('public');
  generateDocument(app);
  const port = +process.env.SERVICE_PORT;
  await app.listen(port, () => {
    console.group(`项目运行在 http://localhost:${port}/api/swagger`);
    console.groupEnd();
  });
}
bootstrap();
