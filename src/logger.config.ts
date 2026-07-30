import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Vercel serverless 文件系统只读，不能挂文件日志
const isServerless = Boolean(process.env.VERCEL);

const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.ms(),
    winston.format.printf(({ level, message, timestamp, ms }) => {
      return `${timestamp} ${level} ${ms} ${message}`;
    }),
    winston.format.json(),
  ),
});

const fileTransports = isServerless
  ? []
  : [
      new DailyRotateFile({
        level: 'info',
        dirname: 'logs',
        filename: 'application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true, // 压缩旧的日志文件
        maxSize: '20m', // 单个文件最大 20MB
        maxFiles: '14d', // 保留最近 14 天的日志
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
      new DailyRotateFile({
        level: 'error',
        dirname: 'logs',
        filename: 'errors-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    ];

export const loggerConfig = {
  transports: [consoleTransport, ...fileTransports],
  format: winston.format.errors({ stack: true }),
};
