// upload.service.ts
import { Injectable } from '@nestjs/common';
import { put } from '@vercel/blob';

@Injectable()
export class UploadService {
  async uploadToVercelBlob(filename: string, content: Buffer): Promise<string> {
    const { url } = await put(filename, content, { access: 'public' });
    return url;
  }
}
