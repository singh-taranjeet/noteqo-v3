import { registerAs } from '@nestjs/config';
import { CONFIG_KEYS } from './config.constants';

export const jwtConfig = registerAs(CONFIG_KEYS.JWT, () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
}));
