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

  async storeFiles(url: string, name: string, size: number) {
    const files = new Files();
    files.fileName = name;
    files.fileUrl = url;
    files.fileSize = this.convertFileSize(size);
    files.fileType = name.split('.')[1];
    console.log(files, 'files内容');
    return this.files.save(files);
  }

  convertFileSize(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}
