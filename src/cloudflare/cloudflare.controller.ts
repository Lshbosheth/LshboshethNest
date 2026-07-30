import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CloudflareService } from './cloudflare.service';
import { CreateDnsRecordDto } from './dto/create-dns-record.dto';
import { UpdateDnsRecordDto } from './dto/update-dns-record.dto';

@ApiTags('Cloudflare DNS 管理')
@Controller('cloudflare/dns')
export class CloudflareController {
  constructor(private readonly cloudflareService: CloudflareService) {}

  @Get('diagnose')
  @ApiOperation({ summary: '自检：验证 token 与 zone 配置是否可用' })
  diagnose() {
    return this.cloudflareService.diagnose();
  }

  @Get()
  @ApiOperation({ summary: '获取 DNS 记录列表' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: '记录类型（A, CNAME, TXT 等）',
  })
  @ApiQuery({ name: 'name', required: false, description: '记录名称' })
  listDnsRecords(@Query('type') type?: string, @Query('name') name?: string) {
    return this.cloudflareService.listDnsRecords(type, name);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个 DNS 记录详情' })
  @ApiParam({ name: 'id', description: 'DNS 记录 ID' })
  getDnsRecord(@Param('id') id: string) {
    return this.cloudflareService.getDnsRecord(id);
  }

  @Post()
  @ApiOperation({ summary: '创建 DNS 记录' })
  createDnsRecord(@Body() createDnsRecordDto: CreateDnsRecordDto) {
    return this.cloudflareService.createDnsRecord(createDnsRecordDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新 DNS 记录' })
  @ApiParam({ name: 'id', description: 'DNS 记录 ID' })
  updateDnsRecord(
    @Param('id') id: string,
    @Body() updateDnsRecordDto: UpdateDnsRecordDto,
  ) {
    return this.cloudflareService.updateDnsRecord(id, updateDnsRecordDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除 DNS 记录' })
  @ApiParam({ name: 'id', description: 'DNS 记录 ID' })
  deleteDnsRecord(@Param('id') id: string) {
    return this.cloudflareService.deleteDnsRecord(id);
  }
}
