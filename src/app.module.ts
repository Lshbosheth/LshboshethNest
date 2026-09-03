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
import { OssAdminModule } from './oss-admin/oss-admin.module';

dotenv.config();

const databaseEnabled = shouldEnableDatabase();
const usePostgres =
  String(process.env.DB_TARGET || '').toLowerCase() === 'postgres' ||
  Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
const databaseConfig = usePostgres ? VercelConfig : MySqlLocalConfig;

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
    OssAdminModule,
    CloudflareModule,
    WechatModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService, LoggerService],
})
export class AppModule {}
