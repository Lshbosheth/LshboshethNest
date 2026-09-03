import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class LocalOssTokenGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const configuredToken = (
      this.configService.get<string>('LOCAL_OSS_TOKEN') ||
      this.configService.get<string>('LOCAL_OSS_UPLOAD_TOKEN') ||
      ''
    ).trim().replace(/^(['"])(.*)\1$/, '$2');

    if (!configuredToken) {
      throw new UnauthorizedException('Local OSS token is not configured');
    }

    const authorization = request.headers.authorization || '';
    const bearerToken = authorization.toLowerCase().startsWith('bearer ')
      ? authorization.slice(7).trim()
      : '';
    const headerToken = String(request.headers['x-upload-token'] || '').trim();

    if (bearerToken === configuredToken || headerToken === configuredToken) {
      return true;
    }

    throw new UnauthorizedException('Invalid Local OSS token');
  }
}
