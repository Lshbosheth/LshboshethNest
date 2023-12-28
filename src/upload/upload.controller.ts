import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiBody,
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { CreateUploadDto } from './dto/create-upload.dto';

@ApiTags('上传文件')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiBearerAuth()
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '文件上传',
    type: CreateUploadDto,
  })
  @ApiOperation({
    summary: '文件上传',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    const contentBuffer: Buffer = file.buffer;
    const originalName = Buffer.from(file.originalname, 'binary').toString(
      'utf-8',
    );
    console.log(file)
    console.log(originalName);
    const url = await this.uploadService.uploadToVercelBlob(
      originalName,
      contentBuffer,
    );
    return await this.uploadService.storeFiles(url, originalName);
  }
}
