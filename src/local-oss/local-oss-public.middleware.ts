import { NextFunction, Request, Response } from 'express';
import { existsSync, statSync } from 'fs';
import { readFile } from 'fs/promises';
import * as path from 'path';

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

export function createLocalOssPublicMiddleware() {
  const root = path.resolve(process.env.LOCAL_OSS_ROOT || 'D:\\localoss');
  const publicHost =
    process.env.LOCAL_OSS_PUBLIC_HOST || 'localoss.lshbosheth.cn';

  return async (req: Request, res: Response, next: NextFunction) => {
    if (
      !['GET', 'HEAD'].includes(req.method) ||
      req.path.startsWith('/api') ||
      getRequestHost(req) !== publicHost
    ) {
      next();
      return;
    }

    let requestedPath: string;
    try {
      requestedPath = decodeURIComponent(req.path);
    } catch {
      res.status(400).send('Bad request');
      return;
    }

    let filePath = path.normalize(path.join(root, requestedPath));
    if (!isInsideRoot(root, filePath)) {
      res.status(403).send('Forbidden');
      return;
    }

    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    } else if (!path.extname(filePath) && existsSync(`${filePath}.html`)) {
      filePath = `${filePath}.html`;
    }

    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      next();
      return;
    }

    const extname = path.extname(filePath).toLowerCase();
    res.setHeader(
      'content-type',
      contentTypes[extname] || 'application/octet-stream',
    );
    res.setHeader('cache-control', 'no-store');

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    res.send(await readFile(filePath));
  };
}

function isInsideRoot(root: string, filePath: string) {
  return filePath === root || filePath.startsWith(`${root}${path.sep}`);
}

function getRequestHost(req: Request) {
  return String(req.headers.host || '')
    .split(':')[0]
    .toLowerCase();
}
