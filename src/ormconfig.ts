import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const VercelConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'ep-aged-waterfall-13013279-pooler.us-east-1.postgres.vercel-storage.com',
  port: 5432,
  username: 'default',
  password: 'WH6FZNOe5asP',
  database: 'verceldb',
  ssl: { rejectUnauthorized: false }, // For local development, consider removing this in production
  synchronize: true, // Automatically create database tables based on entities (set to false in production)
  logging: process.env.NODE_ENV === 'development' ? true : ['error'],
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
};

const MySqlLocalConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '123456',
  database: 'nesttest',
  synchronize: true,
  retryDelay: 500,
  retryAttempts: 10,
  autoLoadEntities: true,
  logging: process.env.NODE_ENV === 'development' ? true : ['error'],
};

export { VercelConfig, MySqlLocalConfig };
