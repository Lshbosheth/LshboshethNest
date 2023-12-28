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
import { v4 as uuidv4 } from 'uuid';

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
    const url = await this.uploadService.uploadToVercelBlob(
      uuidv4(),
      contentBuffer,
    );
    return await this.uploadService.storeFiles(
      url,
      file.originalname,
      file.size,
    );
  }
}
