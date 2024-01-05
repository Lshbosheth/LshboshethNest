import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { QiniuService } from './qiniu.service';

@Controller('qiniu')
export class QiniuController {
  constructor(private readonly qiniuService: QiniuService) {}

  @Get()
  findAll() {
    return this.qiniuService.findAll();
  }

  @Delete(':key')
  remove(@Param('key') key: string) {
    return this.qiniuService.remove(key);
  }

  @Get('/uploadToken')
  uploadToken() {
    return this.qiniuService.getUploadToken();
  }
}
