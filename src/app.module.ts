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

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(MySqlLocalConfig),
    UserModule,
    UtilsModule,
    AuthModule,
    FileManageModule,
    WechatModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
