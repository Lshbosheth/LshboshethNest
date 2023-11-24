import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { UtilsService } from './utils.service';
import { QrCodeDto } from './dto/qrCode.dto';
import { UploadService } from '../upload/upload.service';

@ApiTags('工具模块')
@Controller('utils')
export class UtilsController {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly uploadService: UploadService,
  ) {}

  @Get('/createIdCard/:sex')
  @ApiOperation({
    summary: '生成身份证号',
  })
  @ApiParam({ name: 'sex', description: '性别，1表示男性，2表示女性' })
  createIdCard(@Param('sex') sex: string) {
    return this.utilsService.createIdCard(sex);
  }

  @Post('/qrCode')
  @ApiOperation({
    summary: '生成qrCode',
  })
  async qrCode(@Body() qrCodeDto: QrCodeDto) {
    const qrCodeBase64 = await this.utilsService.createQrCode(qrCodeDto);
    const url = await this.uploadService.uploadToVercelBlob(
      'qrCode.jpg',
      qrCodeBase64,
    );
    return { path: url, name: 'qrCode.jpg' };
  }

  @Delete('/clearBlob/:url')
  @ApiOperation({
    summary: '清除上传文件',
  })
  @ApiParam({ name: 'url', description: '删除文件Url' })
  clearAllBlob(@Param('url') url: string) {
    return this.utilsService.deleteOneBlob(url);
  }

  @Get('/allBlob')
  @ApiOperation({
    summary: '获取所有上传文件列表',
  })
  getAllBlob() {
    return this.utilsService.getAllBlob();
  }
}
