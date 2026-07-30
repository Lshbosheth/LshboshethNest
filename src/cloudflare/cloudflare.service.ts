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
  private readonly tokenHint: string;

  constructor(private configService: ConfigService) {
    // trim 掉粘贴时可能带入的空格/换行，这本身就是一类常见病因
    const apiToken = this.configService
      .get<string>('CLOUDFLARE_API_TOKEN')
      ?.trim();
    this.zoneId = this.configService.get<string>('CLOUDFLARE_ZONE_ID')?.trim();
    this.configured = Boolean(apiToken && this.zoneId);
    this.tokenHint = apiToken
      ? `len=${apiToken.length},tail=${apiToken.slice(-4)}`
      : 'missing';

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

  /**
   * 透传 Cloudflare 的原始错误码，便于定位病因：
   * 10000 token 未被识别 / 9109 token 无该 zone 权限 / 7003 Zone ID 格式错误
   */
  private toHttpException(error: any, fallback: string): HttpException {
    const cfErrors = error.response?.data?.errors;
    const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;

    if (!Array.isArray(cfErrors) || cfErrors.length === 0) {
      return new HttpException(error.message || fallback, status);
    }

    return new HttpException(
      {
        message: cfErrors[0]?.message || fallback,
        cloudflareErrors: cfErrors.map((item: any) => ({
          code: item?.code,
          message: item?.message,
        })),
        // 只回显长度和末 4 位，避免把 token 打到响应或日志里
        tokenHint: this.tokenHint,
        zoneIdUsed: this.zoneId,
      },
      status,
    );
  }

  /** 自检：分别验证 token 有效性和 zone 可访问性 */
  async diagnose() {
    this.ensureConfigured();

    const result: Record<string, any> = {
      tokenHint: this.tokenHint,
      zoneIdUsed: this.zoneId,
    };

    try {
      const verify = await this.client.get('/user/tokens/verify');
      result.tokenValid = true;
      result.tokenStatus = verify.data?.result?.status;
    } catch (error) {
      result.tokenValid = false;
      result.tokenError = error.response?.data?.errors?.[0] || error.message;
    }

    try {
      const zone = await this.client.get(`/zones/${this.zoneId}`);
      result.zoneAccessible = true;
      result.zoneName = zone.data?.result?.name;
    } catch (error) {
      result.zoneAccessible = false;
      result.zoneError = error.response?.data?.errors?.[0] || error.message;
    }

    return result;
  }

  async listDnsRecords(type?: string, name?: string) {
    this.ensureConfigured();
    try {
      const params: any = {};
      if (type) params.type = type;
      if (name) params.name = name;

      const response = await this.client.get(
        `/zones/${this.zoneId}/dns_records`,
        { params },
      );
      return response.data;
    } catch (error) {
      throw this.toHttpException(error, '获取 DNS 记录失败');
    }
  }

  async getDnsRecord(recordId: string) {
    this.ensureConfigured();
    try {
      const response = await this.client.get(
        `/zones/${this.zoneId}/dns_records/${recordId}`,
      );
      return response.data;
    } catch (error) {
      throw this.toHttpException(error, '获取 DNS 记录详情失败');
    }
  }

  async createDnsRecord(createDnsRecordDto: CreateDnsRecordDto) {
    this.ensureConfigured();
    try {
      const response = await this.client.post(
        `/zones/${this.zoneId}/dns_records`,
        createDnsRecordDto,
      );
      return response.data;
    } catch (error) {
      throw this.toHttpException(error, '创建 DNS 记录失败');
    }
  }

  async updateDnsRecord(
    recordId: string,
    updateDnsRecordDto: UpdateDnsRecordDto,
  ) {
    this.ensureConfigured();
    try {
      const response = await this.client.patch(
        `/zones/${this.zoneId}/dns_records/${recordId}`,
        updateDnsRecordDto,
      );
      return response.data;
    } catch (error) {
      throw this.toHttpException(error, '更新 DNS 记录失败');
    }
  }

  async deleteDnsRecord(recordId: string) {
    this.ensureConfigured();
    try {
      const response = await this.client.delete(
        `/zones/${this.zoneId}/dns_records/${recordId}`,
      );
      return response.data;
    } catch (error) {
      throw this.toHttpException(error, '删除 DNS 记录失败');
    }
  }
}
