import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudflareBridgeGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.configService.get<string>('CLOUDFLARE_API_TOKEN')?.trim();
    const request = context.switchToHttp().getRequest<{ headers?: Record<string, string | string[] | undefined> }>();
    const authorization = request.headers?.authorization;
    const provided = Array.isArray(authorization) ? authorization[0] : authorization;
    if (!expected || provided !== `Bearer ${expected}`) throw new UnauthorizedException();
    return true;
  }
}
