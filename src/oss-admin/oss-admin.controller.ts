import { Body, Controller, Delete, Get, Headers, Param, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { OssAdminService } from './oss-admin.service';
import { LocalOssTokenGuard } from '../local-oss/local-oss-token.guard';

@ApiTags('OSS Admin')
@ApiBearerAuth()
@UseGuards(LocalOssTokenGuard)
@Controller('oss-admin')
export class OssAdminController {
  constructor(private readonly service: OssAdminService) {}

  @Get('tree') tree(@Query('path') path = '') { return this.service.tree(path); }
  @Post('folders') folder(@Body() body: { path?: string; name: string }) { return this.service.mkdir(body.path || '', body.name); }
  @Delete('item') remove(@Query('path') path: string) { return this.service.remove(path); }

  @Post('uploads/init') init(@Body() body: { path?: string; name: string; size: number; totalChunks: number }) { return this.service.initUpload(body.path || '', body.name, body.size, body.totalChunks); }

  @Post('uploads/:id/chunk')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('chunk'))
  chunk(@Param('id') id: string, @Headers('x-chunk-index') index: string, @UploadedFile() file: Express.Multer.File) { return this.service.writeChunk(id, Number(index), file?.buffer || Buffer.alloc(0)); }

  @Post('uploads/:id/complete') complete(@Param('id') id: string) { return this.service.complete(id); }

  @Get('download')
  async download(@Query('path') path: string, @Res() res: Response) {
    const result = await this.service.download(path);
    res.setHeader('Content-Length', result.size);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(result.name)}"`);
    result.stream.pipe(res);
  }
}
