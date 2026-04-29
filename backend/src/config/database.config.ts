import { registerAs } from '@nestjs/config';
import { CONFIG_KEYS } from './config.constants';

export const databaseConfig = registerAs(CONFIG_KEYS.DATABASE, () => ({
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  name: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
}));
