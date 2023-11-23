import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { generateDocument } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  generateDocument(app);
  console.log(process);
  console.log(process.env.SERVICE_PORT);
  const port = +process.env.SERVICE_PORT;
  console.log(port);
  await app.listen(port, () => {
    console.group(`项目运行在 http://localhost:${port}/api/swagger`);
    console.log('点击这里展开更多信息');
    console.groupEnd();
  });
}
bootstrap();
