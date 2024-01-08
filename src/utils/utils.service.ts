import { Injectable, NotFoundException } from '@nestjs/common';
import dayjs from 'dayjs';
import { areas } from '../static/areas';
import { QrCodeDto } from './dto/qrCode.dto';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import * as QRCode from 'qrcode';
import { del, list } from '@vercel/blob';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from './entities/config.entity';
import axios from 'axios';
import process from 'process';

@Injectable()
export class UtilsService {
  constructor(@InjectRepository(Config) private config: Repository<Config>) {}
  async createIdCard(sex: string) {
    return this.idNumber(sex);
  }

  async createQrCode(qrCodeDto: QrCodeDto) {
    try {
      return await QRCode.toBuffer(qrCodeDto.text);
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

  async deleteOneBlob(url: string) {
    return del(url);
  }

  async getAllBlob() {
    const { blobs } = await list();
    return blobs;
  }

  async clearAllBlob(): Promise<void> {
    const result: any = await list();
    const blobs = result && result.blobs;
    if (blobs && Array.isArray(blobs)) {
      await Promise.all(blobs.map((blobUrl) => del(blobUrl.url)));
    }
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

  checkSignature(signature: any, timestamp: any, nonce: any): boolean {
    const token = 'NAna0218';
    const tmpArr = [token, timestamp, nonce].sort((a, b) => a.localeCompare(b));
    const tmpStr = tmpArr.join('');
    const hashedStr = require('crypto')
      .createHash('sha1')
      .update(tmpStr)
      .digest('hex');
    return hashedStr === signature;
  }

  async pushMsg(tempId: string, msgData: any) {
    const tianqi = 'FOhSugSZ11ebVdw0a89HDDHoZokg782SsH5I36Q70Rw';
    const openId = 'oq7pJ5fjlzxMwmWXpTkK8qfBx8mc'; //myopenid
    const token = await this.getWechatToken();
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${token}`;
    try {
      const response = await axios.post(url, {
        access_token: token,
        template_id: tempId,
        grant_type: 'authorization_code',
        touser: openId,
        data: msgData,
        miniprogram_state: 'trial',
        lang: 'zh_CN',
      });
      if (response.data) {
        return response.data;
      }
    } catch (error) {}
  }

  async getOpenId(code: string) {
    const appId = 'wx8d1aa3c9bfb8be3a';
    const appSecret = '745fcbcf462c3a99122e6f920879fdde';
    const url = 'https://api.weixin.qq.com/sns/jscode2session';
    try {
      const response = await axios.get(url, {
        params: {
          js_code: code,
          grant_type: 'authorization_code',
          appid: appId,
          secret: appSecret,
        },
      });
      if (response.data) {
        return response.data.openid;
      }
    } catch (error) {
      console.error('Error updating WeChat access token:', error);
    }
  }

  async getWechatToken() {
    const url = 'https://api.weixin.qq.com/cgi-bin/token';
    try {
      const response = await axios.get(url, {
        params: {
          grant_type: 'client_credential',
          appid: process.env.APPID,
          secret: process.env.APPSECRET,
        },
      });
      if (response.data && response.data.access_token) {
        return response.data.access_token;
      }
    } catch (error) {
      console.error('Error updating WeChat access token:', error);
    }
  }

  async pushWeatherMsg() {
    const tempId = 'FOhSugSZ11ebVdw0a89HDEJ-kMKFp7DbCcPEgTNzv94';
    const weatherUrl = 'http://t.weather.sojson.com/api/weather/city/101180101'
    const oneUrl = 'https://api.xygeng.cn/one'
    let weatherInfo = await axios.get(weatherUrl);
    let oneInfo = await axios.get(oneUrl);
    const nowWeather = weatherInfo.data.data.forecast[0]
    const msgData = {
      date1: {
        value: dayjs().format('YYYY年MM月DD日'),
      },
      phrase3: {
        value: nowWeather.type,
      },
      character_string14: {
        value: nowWeather.low.split(' ')[1],
      },
      character_string15: {
        value: nowWeather.high.split(' ')[1],
      },
      thing5: {
        value: oneInfo.data.data.content,
      },
    }
    return await this.pushMsg(tempId, msgData)
  }
}
