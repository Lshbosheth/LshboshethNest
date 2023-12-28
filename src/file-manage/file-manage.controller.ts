import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import { FileManageService } from './file-manage.service';
import { UpdateFileManageDto } from './dto/update-file-manage.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('文件管理')
@Controller('file-manage')
export class FileManageController {
  constructor(private readonly fileManageService: FileManageService) {}

  @Get()
  @ApiOperation({
    summary: '查找所有文件',
  })
  findAll() {
    return this.fileManageService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: '查找单个文件',
  })
  findOne(@Param('id') id: string) {
    return this.fileManageService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '编辑单个文件',
  })
  update(
    @Param('id') id: string,
    @Body() updateFileManageDto: UpdateFileManageDto,
  ) {
    return this.fileManageService.update(id, updateFileManageDto);
  }

  @ApiOperation({
    summary: '删除单个文件',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileManageService.remove(id);
  }
}
