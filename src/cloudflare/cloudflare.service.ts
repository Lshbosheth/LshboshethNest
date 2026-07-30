import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { CreateDnsRecordDto } from './dto/create-dns-record.dto';
import { UpdateDnsRecordDto } from './dto/update-dns-record.dto';

@Injectable()
export class CloudflareService {
  private readonly client: AxiosInstance | null;
  private readonly zoneId: string;
  private readonly configured: boolean;

  constructor(private configService: ConfigService) {
    const apiToken = this.configService.get<string>('CLOUDFLARE_API_TOKEN');
    this.zoneId = this.configService.get<string>('CLOUDFLARE_ZONE_ID');
    this.configured = Boolean(apiToken && this.zoneId);

    // 未配置时不阻塞启动，调用接口时才提示
    this.client = this.configured
      ? axios.create({
          baseURL: 'https://api.cloudflare.com/client/v4',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
        })
      : null;
  }

  private ensureConfigured() {
    if (!this.configured) {
      throw new HttpException(
        'Cloudflare 未配置：请设置 CLOUDFLARE_API_TOKEN 和 CLOUDFLARE_ZONE_ID',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async listDnsRecords(type?: string, name?: string) {
    this.ensureConfigured();
    try {
      const params: any = {};
      if (type) params.type = type;
      if (name) params.name = name;

      const response = await this.client.get(`/zones/${this.zoneId}/dns_records`, { params });
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.errors?.[0]?.message || '获取 DNS 记录失败',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getDnsRecord(recordId: string) {
    this.ensureConfigured();
    try {
      const response = await this.client.get(`/zones/${this.zoneId}/dns_records/${recordId}`);
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.errors?.[0]?.message || '获取 DNS 记录详情失败',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createDnsRecord(createDnsRecordDto: CreateDnsRecordDto) {
    this.ensureConfigured();
    try {
      const response = await this.client.post(`/zones/${this.zoneId}/dns_records`, createDnsRecordDto);
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.errors?.[0]?.message || '创建 DNS 记录失败',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateDnsRecord(recordId: string, updateDnsRecordDto: UpdateDnsRecordDto) {
    this.ensureConfigured();
    try {
      const response = await this.client.patch(
        `/zones/${this.zoneId}/dns_records/${recordId}`,
        updateDnsRecordDto,
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.errors?.[0]?.message || '更新 DNS 记录失败',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteDnsRecord(recordId: string) {
    this.ensureConfigured();
    try {
      const response = await this.client.delete(`/zones/${this.zoneId}/dns_records/${recordId}`);
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.errors?.[0]?.message || '删除 DNS 记录失败',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
