import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VercelConfig } from './ormconfig';
import { UploadModule } from './upload/upload.module';
import { UtilsModule } from './utils/utils.module';
import { AuthModule } from './auth/auth.module';
import { FileManageModule } from './file-manage/file-manage.module';
import { QiniuModule } from './qiniu/qiniu.module';
import { WechatModule } from './wechat/wechat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(VercelConfig),
    UserModule,
    UploadModule,
    UtilsModule,
    AuthModule,
    FileManageModule,
    QiniuModule,
    WechatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
