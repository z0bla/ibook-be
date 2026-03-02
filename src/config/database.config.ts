import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'ibook_user',
  password: process.env.DATABASE_PASSWORD || 'ibook_password',
  database: process.env.DATABASE_NAME || 'ibook_dev',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development', // Auto-create tables in dev only
  logging: process.env.NODE_ENV === 'development', // Show SQL queries in dev
}));
