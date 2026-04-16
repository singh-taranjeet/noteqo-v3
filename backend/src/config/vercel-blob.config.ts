import { registerAs } from '@nestjs/config';
import { CONFIG_KEYS } from './config.constants';

export const vercelBlobConfig = registerAs(CONFIG_KEYS.VERCEL_BLOB, () => ({
  token: process.env.BLOB_READ_WRITE_TOKEN,
}));
