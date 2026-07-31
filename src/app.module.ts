import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MySqlLocalConfig, VercelConfig } from './ormconfig';
import { UtilsModule } from './utils/utils.module';
import { AuthModule } from './auth/auth.module';
import { FileManageModule } from './file-manage/file-manage.module';
import { WechatModule } from './wechat/wechat.module';
import { SocketModule } from './socket/socket.module';
import { WinstonModule } from 'nest-winston';
import { LoggerService } from './logger.service';
import { loggerConfig } from './logger.config';
import { LocalOssModule } from './local-oss/local-oss.module';
import { CloudflareModule } from './cloudflare/cloudflare.module';
import { shouldEnableDatabase } from './database-enabled';
import { CourseProgressModule } from './course-progress/course-progress.module';

dotenv.config();

const databaseEnabled = shouldEnableDatabase();
// Vercel 环境使用 Postgres，本地使用 MySQL
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
const databaseConfig = isVercel ? VercelConfig : MySqlLocalConfig;

const databaseModules = databaseEnabled
  ? [
      TypeOrmModule.forRoot(databaseConfig),
      UserModule,
      UtilsModule,
      AuthModule,
      FileManageModule,
      CourseProgressModule,
    ]
  : [];

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    WinstonModule.forRoot(loggerConfig),
    ...databaseModules,
    LocalOssModule,
    CloudflareModule,
    WechatModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService, LoggerService],
})
export class AppModule {}
