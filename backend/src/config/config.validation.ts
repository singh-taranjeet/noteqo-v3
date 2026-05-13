import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  DATABASE_URL: Joi.string().allow('').optional(),
  DB_HOST: Joi.string().allow('').optional(),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().allow('').optional(),
  DB_USERNAME: Joi.string().allow('').optional(),
  DB_PASSWORD: Joi.string().allow('').optional(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  BLOB_READ_WRITE_TOKEN: Joi.string().required(),
  REDIS_URL: Joi.string().default('redis://localhost:6379'),
});
