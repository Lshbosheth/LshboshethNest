import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const VercelConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lshbosheth',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  retryAttempts: Number(process.env.DB_RETRY_ATTEMPTS || 1),
  retryDelay: Number(process.env.DB_RETRY_DELAY || 1000),
  logging: process.env.NODE_ENV === 'development' ? true : ['error'],
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
};

const MySqlLocalConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nesttest',
  synchronize: true,
  retryDelay: Number(process.env.DB_RETRY_DELAY || 1000),
  retryAttempts: Number(process.env.DB_RETRY_ATTEMPTS || 1),
  autoLoadEntities: true,
  logging: process.env.NODE_ENV === 'development' ? true : ['error'],
};

export { VercelConfig, MySqlLocalConfig };
