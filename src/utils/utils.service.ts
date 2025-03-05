import { Injectable, NotFoundException } from '@nestjs/common';
import dayjs from 'dayjs';
import { areas } from '../static/areas';
import { QrCodeDto } from './dto/qrCode.dto';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import * as QRCode from 'qrcode';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from './entities/config.entity';
import { FileManageService } from '../file-manage/file-manage.service';
import * as svgCaptcha from 'svg-captcha';
import { createTransport, Transporter } from 'nodemailer';
import OpenAI from 'openai';
import { interval, Observable } from 'rxjs';
@Injectable()
export class UtilsService {
  captcha: string = '';
  transporter: Transporter;
  constructor(
    @InjectRepository(Config) private config: Repository<Config>,
    private fileManageService: FileManageService,
  ) {
    this.transporter = createTransport({
      host: 'smtp.qq.com', // smtp服务的域名
      port: 587, // smtp服务的端口
      secure: false,
      auth: {
        user: 'lshbosheth@qq.com', // 你的邮箱地址
        pass: 'mrgooyabtdcibdjd', // 你的授权码
      },
    });
  }

  async sendEmail({ to, subject, html }) {
    await this.transporter.sendMail({
      from: {
        name: 'lshbosheth',
        address: 'lshbosheth@qq.com', // 你的邮箱地址
      },
      to,
      subject,
      html,
    });
  }

  async createIdCard(sex: string) {
    return this.idNumber(sex);
  }

  async createQrCode(qrCodeDto: QrCodeDto) {
    try {
      const qrCodeBase64 = await QRCode.toBuffer(qrCodeDto.text);
      const url = await this.fileManageService.uploadQiniuFile(
        'qrCode.jpg',
        qrCodeBase64,
      );
      console.log(url);
      return url;
    } catch (error) {
      throw new Error(`生成二维码失败: ${error.message}`);
    }
  }

  idNumber(sex: string) {
    let idNumber: number | string =
      areas[Math.floor(Math.random() * areas.length)].code;
    idNumber += this.getRandomBirthday();
    idNumber += this.getRandomNumber(10, 99).toString();
    idNumber += this.getRandomSexNumber(Number(sex), 9, 2).toString();
    const checksum = this.calculateIdCardChecksum(
      idNumber.toString(),
    ).toString();
    return idNumber + checksum;
  }

  getRandomBirthday(): any {
    const start = dayjs('1960-01-01');
    const end = dayjs();
    const randomDays = Math.round(Math.random() * end.diff(start, 'days'));
    return start.add(randomDays, 'day').format('YYYYMMDD');
  }

  getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getRandomSexNumber(min: number, max: number, step: number): number {
    const randomEven =
      min + step * Math.floor(Math.random() * ((max - min) / step + 1));
    return randomEven;
  }

  calculateIdCardChecksum(idCardWithoutChecksum: string): number | string {
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    let sum = 0;

    for (let i = 0; i < 17; i++) {
      sum += parseInt(idCardWithoutChecksum.charAt(i)) * weights[i];
    }

    const remainder = sum % 11;
    const checksumMap = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];

    return checksumMap[remainder];
  }

  async getAllConfigs(): Promise<Config[]> {
    const configs = await this.config.find();
    return configs;
  }

  async createConfig(createConfigDto: CreateConfigDto) {
    const config = this.createConfigEntity(createConfigDto);
    return await this.config.save(config);
  }

  async updateConfig(updateConfigDto: UpdateConfigDto) {
    const { infoList } = updateConfigDto;
    await this.config.clear();
    const configEntities = infoList.map((info) =>
      this.createConfigEntity(info),
    );
    await this.config.save(configEntities);
  }

  async generateCaptcha() {
    return svgCaptcha.create();
  }

  private createConfigEntity(info: CreateConfigDto): Config {
    const config = new Config();
    config.configName = info.configName;
    config.configSort = info.configSort;
    return config;
  }

  async testDeepSeek() {
    const client = new OpenAI({
      apiKey: process.env.DASHSCOPE_API_KEY,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });

    try {
      const stream = await client.chat.completions.create({
        model: 'qwen-plus-latest',
        messages: [{ role: 'user', content: '9.9和9.11谁大' }],
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
