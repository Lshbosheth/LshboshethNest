import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const VercelConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'ep-aged-waterfall-13013279-pooler.us-east-1.postgres.vercel-storage.com',
  port: 5432,
  username: 'default',
  password: 'WH6FZNOe5asP',
  database: 'verceldb',
  ssl: { rejectUnauthorized: false }, // For local development, consider removing this in production
  synchronize: false, // 改成 false，避免重复建表冲突
  retryAttempts: Number(process.env.DB_RETRY_ATTEMPTS || 1),
  retryDelay: Number(process.env.DB_RETRY_DELAY || 1000),
  logging: process.env.NODE_ENV === 'development' ? true : ['error'],
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
};

const MySqlLocalConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'NAna-0218',
  database: 'nesttest',
  synchronize: true,
  retryDelay: Number(process.env.DB_RETRY_DELAY || 1000),
  retryAttempts: Number(process.env.DB_RETRY_ATTEMPTS || 1),
  autoLoadEntities: true,
  logging: process.env.NODE_ENV === 'development' ? true : ['error'],
};

export { VercelConfig, MySqlLocalConfig };
