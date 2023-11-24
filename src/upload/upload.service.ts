// upload.service.ts
import { Injectable } from '@nestjs/common';
import { put } from '@vercel/blob';

@Injectable()
export class UploadService {
  async uploadToVercelBlob(filename: string, content: string): Promise<string> {
    const { url } = await put(filename, content, { access: 'public' });
    return url;
  }
}
