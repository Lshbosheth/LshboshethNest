import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileManageService } from './file-manage.service';
import { UpdateFileManageDto } from './dto/update-file-manage.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUploadDto } from './dto/create-upload.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('文件管理')
@Controller('files')
export class FileManageController {
  constructor(private readonly fileManageService: FileManageService) {}

  @ApiBearerAuth()
  @Post('uploadVercel')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '文件上传',
    type: CreateUploadDto,
  })
  @ApiOperation({
    summary: '文件上传至Vercel对象存储',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const contentBuffer: Buffer = file.buffer;
    const originalName = Buffer.from(file.originalname, 'binary').toString(
      'utf-8',
    );
    const fileType =
      originalName.split('.')[originalName.split('.').length - 1];
    const url = await this.fileManageService.uploadToVercelBlob(
      uuidv4() + '.' + fileType,
      contentBuffer,
    );
    return await this.fileManageService.storeFiles(
      url,
      originalName,
      file.size,
    );
  }

  @Get('vercelFiles')
  @ApiOperation({
    summary: '查找Vercel对象存储中所有文件',
  })
  findAll() {
    return this.fileManageService.findAllVercelFiles();
  }

  @Get('vercelFiles/:id')
  @ApiOperation({
    summary: '查找Vercel对象存储中单个文件',
  })
  findOne(@Param('id') id: string) {
    return this.fileManageService.findOneVercelFile(id);
  }

  @Patch('vercelFiles/:id')
  @ApiOperation({
    summary: '编辑Vercel对象存储中单个文件',
  })
  update(
    @Param('id') id: string,
    @Body() updateFileManageDto: UpdateFileManageDto,
  ) {
    return this.fileManageService.updateVercelFile(id, updateFileManageDto);
  }

  @ApiOperation({
    summary: '删除Vercel对象存储中单个文件',
  })
  @Delete('vercelFiles/:id')
  remove(@Param('id') id: string) {
    return this.fileManageService.removeVercelFile(id);
  }

  @ApiOperation({
    summary: '查找七牛云对象存储中所有文件',
  })
  @Get('qiniuFiles')
  findAllQiniuFile() {
    return this.fileManageService.findAllQiniuFile();
  }

  @ApiOperation({
    summary: '删除七牛云对象存储中单个文件',
  })
  @Delete('qiniuFiles/:key')
  removeQiniuFile(@Param('key') key: string) {
    return this.fileManageService.removeQiniuFile(key);
  }

  @ApiOperation({
    summary: '获取七牛云对象存储上传Token',
  })
  @Get('qiniuFiles/uploadToken')
  getQiniuUploadToken() {
    return this.fileManageService.getQiniuUploadToken();
  }
}
