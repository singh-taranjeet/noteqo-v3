import { registerAs } from '@nestjs/config';
import { CONFIG_KEYS } from './config.constants';

export const appConfig = registerAs(CONFIG_KEYS.APP, () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
}));
