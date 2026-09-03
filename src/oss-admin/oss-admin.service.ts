import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs, createReadStream } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

type UploadMeta = { id: string; target: string; size: number; totalChunks: number; name: string };

@Injectable()
export class OssAdminService {
  private readonly root: string;
  private readonly temp: string;

  constructor(private readonly config: ConfigService) {
    this.root = path.resolve(this.config.get<string>('OSS_ROOT') || '/data/oss');
    this.temp = path.join(this.root, '.uploads');
  }

  private safe(input = '') {
    const clean = input.replace(/\\/g, '/').replace(/^\/+/, '');
    const parts = clean.split('/').filter(Boolean);
    if (parts.some((part) => part === 'demo' || part === '.' || part === '..')) {
      throw new BadRequestException('demo 目录不可管理');
    }
    const result = path.resolve(this.root, ...parts);
    if (result !== this.root && !result.startsWith(`${this.root}${path.sep}`)) {
      throw new BadRequestException('非法路径');
    }
    return result;
  }

  private relative(file: string) { return path.relative(this.root, file).replace(/\\/g, '/'); }

  async tree(prefix = '') {
    const dir = this.safe(prefix);
    await fs.mkdir(this.root, { recursive: true });
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return Promise.all(entries.filter((e) => e.name !== '.uploads' && e.name !== 'demo').map(async (e) => {
      const full = path.join(dir, e.name);
      const stat = await fs.stat(full);
      return { name: e.name, path: this.relative(full), type: e.isDirectory() ? 'folder' : 'file', size: e.isDirectory() ? undefined : stat.size, updatedAt: stat.mtime.toISOString() };
    }));
  }

  async mkdir(prefix: string, name: string) {
    if (!name || name.includes('/') || name.includes('\\') || name === 'demo') throw new BadRequestException('非法文件夹名称');
    const dir = this.safe(path.posix.join(prefix || '', name));
    await fs.mkdir(dir, { recursive: false });
    return { path: this.relative(dir), name };
  }

  async remove(target: string) {
    const file = this.safe(target);
    if (file === this.root) throw new BadRequestException('不能删除根目录');
    await fs.rm(file, { recursive: true, force: false });
    return { deleted: this.relative(file) };
  }

  async initUpload(prefix: string, name: string, size: number, totalChunks: number) {
    if (!name || name.includes('/') || name.includes('\\') || name === 'demo') throw new BadRequestException('非法文件名');
    if (!Number.isInteger(totalChunks) || totalChunks < 1 || totalChunks > 100000) throw new BadRequestException('分片数量无效');
    const target = this.safe(path.posix.join(prefix || '', name));
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.mkdir(this.temp, { recursive: true });
    const id = randomUUID();
    const meta: UploadMeta = { id, target, size: Number(size) || 0, totalChunks, name };
    await fs.mkdir(path.join(this.temp, id));
    await fs.writeFile(path.join(this.temp, id, 'meta.json'), JSON.stringify(meta));
    return { uploadId: id, chunkSize: 8 * 1024 * 1024 };
  }

  private async meta(id: string) {
    try { return JSON.parse(await fs.readFile(path.join(this.temp, id, 'meta.json'), 'utf8')) as UploadMeta; }
    catch { throw new NotFoundException('上传任务不存在'); }
  }

  async writeChunk(id: string, index: number, data: Buffer) {
    const meta = await this.meta(id);
    if (!Number.isInteger(index) || index < 0 || index >= meta.totalChunks) throw new BadRequestException('分片序号无效');
    await fs.writeFile(path.join(this.temp, id, `${index}.part`), data);
    return { index, received: data.length };
  }

  async complete(id: string) {
    const meta = await this.meta(id);
    const output = await fs.open(meta.target, 'w');
    try {
      for (let i = 0; i < meta.totalChunks; i++) {
        const part = path.join(this.temp, id, `${i}.part`);
        try { await output.writeFile(await fs.readFile(part)); } catch { throw new BadRequestException(`缺少第 ${i} 个分片`); }
      }
    } finally { await output.close(); }
    await fs.rm(path.join(this.temp, id), { recursive: true, force: true });
    const stat = await fs.stat(meta.target);
    return { path: this.relative(meta.target), name: meta.name, size: stat.size };
  }

  async download(target: string) {
    const file = this.safe(target);
    const stat = await fs.stat(file).catch(() => { throw new NotFoundException('文件不存在'); });
    if (!stat.isFile()) throw new BadRequestException('只能下载文件');
    return { stream: createReadStream(file), name: path.basename(file), size: stat.size };
  }
}
