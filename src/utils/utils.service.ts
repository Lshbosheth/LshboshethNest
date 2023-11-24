import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { areas } from '../static/areas';
import { QrCodeDto } from './dto/qrCode.dto';
import * as QRCode from 'qrcode';
import { del, list, ListFoldedBlobResult } from '@vercel/blob';

@Injectable()
export class UtilsService {
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
}