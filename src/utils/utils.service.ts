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

@Injectable()
export class UtilsService {
  constructor(
    @InjectRepository(Config) private config: Repository<Config>,
    private fileManageService: FileManageService,
  ) {}
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

  async getAllConfigs(): Promise<{ [key: string]: string }> {
    const configs = await this.config.find();
    const result = {};
    configs.forEach((config) => {
      result[config.configName] = config.configValue;
    });

    return result;
  }

  async createConfig(createConfigDto: CreateConfigDto) {
    const config = new Config();
    config.configName = createConfigDto.configName;
    config.configValue = createConfigDto.configValue;
    config.description = createConfigDto.description;
    return await this.config.save(config);
  }

  async updateConfig(updateConfigDto: UpdateConfigDto) {
    const { configName, configValue } = updateConfigDto;

    const existingConfig = await this.config.findOne({ where: { configName } });

    if (!existingConfig) {
      throw new NotFoundException(`Config with name ${configName} not found`);
    }

    // 更新配置项数据
    if (configValue !== undefined) {
      existingConfig.configValue = configValue;
    }

    const savedConfig = await this.config.save(existingConfig);
    return savedConfig;
  }
}
