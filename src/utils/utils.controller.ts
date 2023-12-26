import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { UtilsService } from './utils.service';
import { QrCodeDto } from './dto/qrCode.dto';
import { CreateConfigDto } from './dto/create-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
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
  @ApiParam({ name: 'sex', description: '性别,1表示男性,2表示女性' })
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
  deleteOneBlob(@Param('url') url: string) {
    return this.utilsService.deleteOneBlob(url);
  }

  @Delete('/clearAllBlob')
  @ApiOperation({
    summary: '清除所有上传文件',
  })
  clearAllBlob() {
    return this.utilsService.clearAllBlob();
  }

  @Get('/allBlob')
  @ApiOperation({
    summary: '获取所有上传文件列表',
  })
  getAllBlob() {
    return this.utilsService.getAllBlob();
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

  @Get('/wechatPush')
  @ApiOperation({
    summary: '微信小程序测试',
  })
  async wechatPush(@Query() query: any) {
    console.log(query);
    const checkSignature = this.utilsService.checkSignature(query);
    return checkSignature;
  }
}
