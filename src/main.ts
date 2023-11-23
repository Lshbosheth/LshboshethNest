import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { generateDocument } from './swagger';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './global/interceptor/transform/transform.interceptor';
import { HttpExceptionFilter } from './global/filter/http-exception/http-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  generateDocument(app);
  const port = +process.env.SERVICE_PORT;
  console.log(port);
  await app.listen(port, () => {
    console.group(`项目运行在 http://localhost:${port}/api/swagger`);
    console.groupEnd();
  });
}
bootstrap();
