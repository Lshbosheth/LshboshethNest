import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  LocalOssMultipartUploadDto,
  LocalOssUploadDto,
} from './dto/local-oss-upload.dto';
import { LocalOssListQueryDto } from './dto/local-oss-list-query.dto';
import { LocalOssRenameDto } from './dto/local-oss-rename.dto';
import { LocalOssService } from './local-oss.service';
import { LocalOssTokenGuard } from './local-oss-token.guard';

@ApiTags('Local OSS')
@ApiBearerAuth()
@UseGuards(LocalOssTokenGuard)
@Controller('local-oss')
export class LocalOssController {
  constructor(private readonly localOssService: LocalOssService) {}

  @Post('upload')
  @ApiOperation({
    summary: '上传 HTML 到本机 Local OSS',
    description:
      '鉴权方式：Authorization: Bearer <LOCAL_OSS_TOKEN> 或 x-upload-token。上传后可通过返回的 url 公开访问。',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: LocalOssMultipartUploadDto })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: LocalOssUploadDto,
  ) {
    const filename = body.name || file?.originalname || '';
    const content = file?.buffer || body.html;
    return this.localOssService.uploadHtml(filename, content);
  }

  @Post('upload-json')
  @ApiOperation({
    summary: '通过 JSON 上传 HTML 到本机 Local OSS',
  })
  uploadJson(@Body() body: LocalOssUploadDto) {
    return this.localOssService.uploadHtml(body.name, body.html);
  }

  @Get('list')
  @ApiOperation({
    summary: '查询本机 Local OSS HTML 文件列表',
  })
  list(@Query() query: LocalOssListQueryDto) {
    return this.localOssService.list(query.prefix || '');
  }

  @Get(':name')
  @ApiOperation({
    summary: '查询单个 Local OSS HTML 文件元信息',
  })
  @ApiParam({ name: 'name', example: 'my-demo-page' })
  getMeta(@Param('name') name: string) {
    return this.localOssService.getMeta(name);
  }

  @Put(':name')
  @ApiOperation({
    summary: '覆盖更新单个 Local OSS HTML 文件',
  })
  @ApiParam({ name: 'name', example: 'my-demo-page' })
  update(@Param('name') name: string, @Body() body: LocalOssUploadDto) {
    return this.localOssService.update(name, body.html);
  }

  @Patch(':name/rename')
  @ApiOperation({
    summary: '重命名单个 Local OSS HTML 文件',
  })
  @ApiParam({ name: 'name', example: 'my-demo-page' })
  rename(@Param('name') name: string, @Body() body: LocalOssRenameDto) {
    return this.localOssService.rename(name, body.name);
  }

  @Delete(':name')
  @ApiOperation({
    summary: '删除单个 Local OSS HTML 文件',
  })
  @ApiParam({ name: 'name', example: 'my-demo-page' })
  remove(@Param('name') name: string) {
    return this.localOssService.remove(name);
  }
}
