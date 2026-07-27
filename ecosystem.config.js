const localOssWorkDir =
  'C:/Users/EDY/Documents/Codex/2026-07-07/new-chat/work';

module.exports = {
  apps: [
    {
      name: 'lshbosheth-nest',
      cwd: 'D:/lshbosheth/LshboshethNest',
      script: 'D:/lshbosheth/LshboshethNest/dist/src/main.js',
      interpreter: 'node',
      watch: false,
      autorestart: true,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'localoss-tunnel',
      cwd: localOssWorkDir,
      script: `${localOssWorkDir}/tools/cloudflared.exe`,
      args: [
        'tunnel',
        '--config',
        `${localOssWorkDir}/cloudflared-local-oss.yml`,
        'run',
      ],
      interpreter: 'none',
      watch: false,
      autorestart: true,
      restart_delay: 5000,
      min_uptime: '10s',
      max_restarts: 50,
      kill_timeout: 10000,
      merge_logs: true,
      time: true,
      env_production: {},
    },
  ],
};
