import { execFileSync } from 'child_process';
import { MySqlLocalConfig, VercelConfig } from './ormconfig';

type DatabaseMode = 'auto' | 'true' | 'false';
type TcpDatabaseConfig = { host?: string; port?: number };

export function shouldEnableDatabase() {
  const mode = String(process.env.ENABLE_DATABASE || 'auto').toLowerCase() as
    | DatabaseMode
    | string;

  if (mode === 'false') return false;
  if (mode === 'true') return true;

  if (String(process.env.DB_TARGET || '').toLowerCase() === 'postgres') {
    return true;
  }

  // Vercel 环境检测：存在 VERCEL 环境变量时强制启用数据库
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    return true;
  }

  const config =
    String(process.env.DB_TARGET || 'mysql').toLowerCase() === 'postgres'
      ? VercelConfig
      : MySqlLocalConfig;
  const tcpConfig = config as TcpDatabaseConfig;

  return isLocalDatabaseListening(
    String(tcpConfig.host),
    Number(tcpConfig.port || 3306),
  );
}

function isLocalDatabaseListening(host: string, port: number) {
  // netstat.exe 探测只在 Windows 本地有意义
  if (process.platform !== 'win32') {
    return false;
  }

  if (!['localhost', '127.0.0.1', '::1'].includes(host)) {
    return false;
  }

  try {
    const output = execFileSync('netstat.exe', ['-ano', '-p', 'tcp'], {
      encoding: 'utf-8',
      timeout: 1000,
      windowsHide: true,
    });
    const listeningPattern = new RegExp(
      `^\\s*TCP\\s+\\S+:${port}\\s+\\S+\\s+LISTENING\\s+\\d+\\s*$`,
      'im',
    );
    return listeningPattern.test(output);
  } catch {
    return false;
  }
}
