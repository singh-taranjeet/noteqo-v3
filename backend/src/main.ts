import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { CONFIG_KEYS } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const appConfig = configService.get(CONFIG_KEYS.APP);

  // app.enableCors({
  //   origin: appConfig.frontendUrl,
  //   credentials: true,
  // });
  app.enableCors();

  await app.listen(appConfig.port);
}
bootstrap();
