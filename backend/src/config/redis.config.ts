import { registerAs } from '@nestjs/config';
import { CONFIG_KEYS } from './config.constants';

export const redisConfig = registerAs(CONFIG_KEYS.REDIS, () => ({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
}));
