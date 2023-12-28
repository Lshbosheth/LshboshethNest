import { Injectable } from '@nestjs/common';
import { put } from '@vercel/blob';
import { Repository } from 'typeorm';
import { Files } from './entities/upload.entity';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class UploadService {
  constructor(@InjectRepository(Files) private files: Repository<Files>) {}

  async uploadToVercelBlob(filename: string, content: Buffer): Promise<string> {
    const { url } = await put(filename, content, { access: 'public' });
    return url;
  }

  async storeFiles(url: string, name: string) {
    const files = new Files();
    files.fileName = name;
    files.fileUrl = url;
    files.fileSize = name;
    files.fileType = name;
    return this.files.save(files);
  }
}
