import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

export interface LocalOssFile {
  name: string;
  file: string;
  path: string;
  url: string;
  urlWithExtension: string;
  size: number;
  updatedAt: Date;
}

export interface LocalOssTreeNode {
  name: string;
  type: 'directory' | 'file';
  path: string;
  url?: string;
  urlWithExtension?: string;
  size?: number;
  updatedAt?: Date;
  children?: LocalOssTreeNode[];
}

@Injectable()
export class LocalOssService {
  private readonly root: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.root = path.resolve(
      this.configService.get<string>('LOCAL_OSS_ROOT') || 'D:\\localoss',
    );
    this.publicBaseUrl = (
      this.configService.get<string>('LOCAL_OSS_PUBLIC_URL') ||
      'https://localoss.lshbosheth.cn'
    ).replace(/\/$/, '');
  }

  async uploadHtml(name: string, content: Buffer | string) {
    const buffer = Buffer.isBuffer(content)
      ? content
      : Buffer.from(String(content || ''), 'utf-8');

    if (!buffer.length) {
      throw new BadRequestException('HTML content is empty');
    }

    const { slug, filePath } = await this.getUniqueHtmlPath(
      this.makeSlug(name),
    );

    await fs.mkdir(this.root, { recursive: true });
    await fs.writeFile(filePath, buffer);

    return this.toResponse(slug, filePath, await fs.stat(filePath));
  }

  async list(prefix = ''): Promise<LocalOssTreeNode[]> {
    await fs.mkdir(this.root, { recursive: true });
    const normalizedPrefix = this.normalizePathPrefix(prefix);
    const files = await this.walk(this.root);
    const matchedFiles = files
      .filter((filePath) => filePath.endsWith('.html'))
      .map((filePath) => this.toRelativePath(filePath))
      .filter((relativePath) =>
        normalizedPrefix ? relativePath.startsWith(normalizedPrefix) : true,
      )
      .sort();

    const items = await Promise.all(
      matchedFiles.map(async (relativePath) => {
        const filePath = path.join(this.root, relativePath);
        const stat = await fs.stat(filePath);
        return this.toResponse(
          this.stripHtmlExtension(relativePath),
          filePath,
          stat,
        );
      }),
    );

    return this.toTree(items);
  }

  async getMeta(name: string) {
    const filePath = await this.resolveExistingHtmlPath(name);
    const stat = await fs.stat(filePath);
    return this.toResponse(
      this.stripHtmlExtension(this.toRelativePath(filePath)),
      filePath,
      stat,
    );
  }

  async update(name: string, content: Buffer | string) {
    const filePath = await this.resolveExistingHtmlPath(name);
    const buffer = Buffer.isBuffer(content)
      ? content
      : Buffer.from(String(content || ''), 'utf-8');

    if (!buffer.length) {
      throw new BadRequestException('HTML content is empty');
    }

    await fs.writeFile(filePath, buffer);
    const stat = await fs.stat(filePath);
    return this.toResponse(
      this.stripHtmlExtension(this.toRelativePath(filePath)),
      filePath,
      stat,
    );
  }

  async rename(name: string, newName: string) {
    const filePath = await this.resolveExistingHtmlPath(name);
    const { slug, filePath: newFilePath } = await this.getUniqueHtmlPath(
      this.makeSlug(newName),
    );

    await fs.rename(filePath, newFilePath);
    const stat = await fs.stat(newFilePath);
    return this.toResponse(slug, newFilePath, stat);
  }

  async remove(name: string) {
    const filePath = await this.resolveExistingHtmlPath(name);
    await fs.unlink(filePath);
    return {
      deleted: true,
      name: this.stripHtmlExtension(this.toRelativePath(filePath)),
    };
  }

  getRoot() {
    return this.root;
  }

  private async walk(directory: string): Promise<string[]> {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const result: string[] = [];

    for (const entry of entries) {
      const filePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        result.push(...(await this.walk(filePath)));
      } else {
        result.push(filePath);
      }
    }

    return result;
  }

  private makeSlug(input: string) {
    const cleaned = String(input || '')
      .replace(/\.[a-z0-9]+$/i, '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120);

    if (cleaned) {
      return cleaned;
    }

    const now = new Date();
    const timestamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      '-',
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0'),
    ].join('');

    return `page-${timestamp}-${randomBytes(3).toString('hex')}`;
  }

  private async getUniqueHtmlPath(slug: string) {
    let currentSlug = slug;
    let counter = 2;
    let filePath = this.resolveHtmlPath(currentSlug);

    while (await this.exists(filePath)) {
      currentSlug = `${slug}-${counter}`;
      filePath = this.resolveHtmlPath(currentSlug);
      counter += 1;
    }

    return { slug: currentSlug, filePath };
  }

  private resolveHtmlPath(name: string) {
    const cleanName = this.stripHtmlExtension(this.makeSlug(name));
    const filePath = path.resolve(this.root, `${cleanName}.html`);

    if (!this.isInsideRoot(filePath)) {
      throw new BadRequestException('Invalid file path');
    }

    return filePath;
  }

  private async resolveExistingHtmlPath(name: string) {
    const filePath = this.resolveHtmlPath(name);

    if (!(await this.exists(filePath))) {
      throw new NotFoundException('Local OSS file not found');
    }

    return filePath;
  }

  private isInsideRoot(filePath: string) {
    return (
      filePath === this.root || filePath.startsWith(`${this.root}${path.sep}`)
    );
  }

  private async exists(filePath: string) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private normalizePathPrefix(prefix: string) {
    return this.stripHtmlExtension(String(prefix || ''))
      .replace(/\\/g, '/')
      .replace(/^\/+|\/+$/g, '');
  }

  private toRelativePath(filePath: string) {
    return path.relative(this.root, filePath).replace(/\\/g, '/');
  }

  private stripHtmlExtension(name: string) {
    return String(name || '').replace(/\.html$/i, '');
  }

  private toResponse(
    name: string,
    filePath: string,
    stat: { size: number; mtime: Date },
  ) {
    const normalizedName = name.replace(/\\/g, '/');
    return {
      name: normalizedName,
      file: `${normalizedName}.html`,
      path: this.toRelativePath(filePath),
      url: `${this.publicBaseUrl}/${normalizedName}`,
      urlWithExtension: `${this.publicBaseUrl}/${normalizedName}.html`,
      size: stat.size,
      updatedAt: stat.mtime,
    };
  }

  private toTree(items: LocalOssFile[]): LocalOssTreeNode[] {
    const rootNodes: LocalOssTreeNode[] = [];

    for (const item of items) {
      const parts = item.name.split('/').filter(Boolean);
      let currentLevel = rootNodes;
      let currentPath = '';

      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isFile = index === parts.length - 1;

        if (isFile) {
          currentLevel.push({
            name: part,
            type: 'file',
            path: item.path,
            url: item.url,
            urlWithExtension: item.urlWithExtension,
            size: item.size,
            updatedAt: item.updatedAt,
          });
          return;
        }

        let directory = currentLevel.find(
          (node) => node.type === 'directory' && node.name === part,
        );

        if (!directory) {
          directory = {
            name: part,
            type: 'directory',
            path: currentPath,
            children: [],
          };
          currentLevel.push(directory);
        }

        currentLevel = directory.children;
      });
    }

    return this.sortTree(rootNodes);
  }

  private sortTree(nodes: LocalOssTreeNode[]) {
    return nodes
      .map((node) => ({
        ...node,
        children: node.children ? this.sortTree(node.children) : undefined,
      }))
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }
}
