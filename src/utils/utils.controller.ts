import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Response,
  Sse,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { UtilsService } from './utils.service';
import { QrCodeDto } from './dto/qrCode.dto';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { CaptchaObj } from 'svg-captcha';
import { interval, Observable, Subject, takeUntil } from 'rxjs';
import { EmailDto } from './dto/email.dto';
import { sseDto } from './dto/sseDto.dto';
import { emailTemplate } from '../static/emailTemplate';
import OpenAI from 'openai';

@ApiTags('工具模块')
@Controller('utils')
export class UtilsController {
  constructor(private readonly utilsService: UtilsService) {}

  @Get('/captcha')
  @ApiOperation({
    summary: '生成图形验证码',
  })
  async createCaptcha(@Response() res: any) {
    const captcha: CaptchaObj = await this.utilsService.generateCaptcha();
    this.utilsService.captcha = captcha.text;
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

  @Post('/updateConfig')
  @ApiOperation({
    summary: '更新配置项',
  })
  async updateConfig(@Body() updateConfigDto: UpdateConfigDto) {
    const editedConfig = await this.utilsService.updateConfig(updateConfigDto);
    return editedConfig;
  }

  @Post('sse')
  @Sse('sse')
  @ApiOperation({
    summary: '测试Stream/POST',
  })
  postStream(@Body() data: any) {
    console.log(data);
    return new Observable((observer) => {
      interval(1000).subscribe(() => {
        observer.next({ message: 'Hello World 2!' });
      });
    });
  }

  @Sse('sse')
  @ApiOperation({
    summary: '测试Stream/GET',
  })
  stream(@Body() data: any) {
    console.log(data, '测试Stream/GET');
    return new Observable((observer) => {
      interval(1000).subscribe(() => {
        observer.next({ message: 'Hello World 2!' });
      });
    });
  }

  @Post('sendEmail')
  @ApiOperation({
    summary: '发送邮件',
  })
  sendEmail(@Body() emailBody: EmailDto) {
    return this.utilsService.sendEmail({
      to: emailBody.destinationEmail || '',
      subject: emailBody.subject || '',
      html: emailBody.htmlCode ? emailTemplate[emailBody.htmlCode] : '',
    });
  }

  @Sse('testDeepSeek')
  @ApiOperation({
    summary: 'deepSeek',
  })
  testDeepSeek() {
    return this.utilsService.testDeepSeek();
  }

  @Post('postDeepSeek')
  @Sse()
  @ApiOperation({
    summary: '测试postDeepSeek',
  })
  async postDeepSeek(@Body() postData: sseDto) {
    console.log(postData);
    const client = new OpenAI({
      apiKey: process.env.DASHSCOPE_API_KEY,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });
    try {
      const stream = await client.chat.completions.create({
        model: 'deepseek-r1',
        messages: [{ role: 'user', content: postData.question }],
        stream: true,
      });
      let reasoningContent = '';
      let answerContent = '';
      return new Observable((observer) => {
        (async () => {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta;
            if (
              delta &&
              'reasoning_content' in delta &&
              delta.reasoning_content
            ) {
              reasoningContent += delta.reasoning_content;
              observer.next({ reasoning: delta.reasoning_content });
            }
            if (delta && 'content' in delta && delta.content) {
              answerContent += delta.content;
              observer.next({ content: delta.content });
            }
          }
          console.log(`\n完整思考过程：${reasoningContent}`);
          console.log(`完整的回复：${answerContent}`);
          observer.complete();
        })();
      });
    } catch (error) {
      console.error('发生错误:', error);
    }
  }
}
