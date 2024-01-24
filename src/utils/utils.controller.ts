import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Response,
  Session,
  Sse,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { UtilsService } from './utils.service';
import { QrCodeDto } from './dto/qrCode.dto';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { CaptchaObj } from 'svg-captcha';
import { interval, Observable } from 'rxjs';

@ApiTags('工具模块')
@Controller('utils')
export class UtilsController {
  constructor(private readonly utilsService: UtilsService) {}

  @Get('/captcha')
  @ApiOperation({
    summary: '生成图形验证码',
  })
  async createCaptcha(@Response() res: any, @Session() session: any) {
    const captcha: CaptchaObj = await this.utilsService.generateCaptcha();
    session.captcha = captcha.text;
    res.type('svg');
    res.send(captcha.data);
  }

  @Get('/createIdCard/:sex')
  @ApiOperation({
    summary: '生成身份证号',
  })
  @ApiParam({ name: 'sex', description: '性别,1表示男性,2表示女性' })
  createIdCard(@Param('sex') sex: string) {
    return this.utilsService.createIdCard(sex);
  }

  @Post('/qrCode')
  @ApiOperation({
    summary: '生成qrCode',
  })
  async qrCode(@Body() qrCodeDto: QrCodeDto) {
    console.log(qrCodeDto);
    const url = await this.utilsService.createQrCode(qrCodeDto);
    return { path: url, name: 'qrCode.jpg' };
  }

  @Get('/allConfig')
  @ApiOperation({
    summary: '获取所有配置项',
  })
  async getAllConfigs() {
    const configs = await this.utilsService.getAllConfigs();
    return configs;
  }

  @Post('/createdConfig')
  @ApiOperation({
    summary: '创建配置项',
  })
  async createConfig(@Body() createConfigDto: CreateConfigDto) {
    const createdConfig = await this.utilsService.createConfig(createConfigDto);
    return createdConfig;
  }

  @Put('/updateConfig')
  @ApiOperation({
    summary: '更新配置项',
  })
  async updateConfig(@Body() updateConfigDto: UpdateConfigDto) {
    console.log(updateConfigDto);
    const editedConfig = await this.utilsService.updateConfig(updateConfigDto);
    return editedConfig;
  }

  @Sse('sse')
  @ApiOperation({
    summary: '测试Stream',
  })
  stream() {
    return new Observable((observer) => {
      interval(1000).subscribe(() => {
        observer.next({ message: 'Hello World 2!' });
      });
    });
  }
}
