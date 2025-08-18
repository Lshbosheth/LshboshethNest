import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MySqlLocalConfig } from './ormconfig';
import { UtilsModule } from './utils/utils.module';
import { AuthModule } from './auth/auth.module';
import { FileManageModule } from './file-manage/file-manage.module';
import { WechatModule } from './wechat/wechat.module';
import { SocketModule } from './socket/socket.module';
import { WinstonModule } from 'nest-winston';
import { LoggerService } from './logger.service';
import { loggerConfig } from './logger.config';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    WinstonModule.forRoot(loggerConfig),
    TypeOrmModule.forRoot(MySqlLocalConfig),
    UserModule,
    UtilsModule,
    AuthModule,
    FileManageModule,
    WechatModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService, LoggerService],
})
export class AppModule {}
