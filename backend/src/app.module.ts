import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  configValidationSchema,
  databaseConfig,
  appConfig,
  jwtConfig,
  vercelBlobConfig,
  CONFIG_KEYS,
} from './config';
import { UsersModule } from './users';
import { NotesModule } from './notes';
import { SpacesModule } from './spaces';
import { AuthModule } from './auth/auth.module';
import { ClsModule } from 'nestjs-cls';
import { SharedModule } from './shared/shared.module';
import { MediaModule } from './media';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      load: [databaseConfig, appConfig, jwtConfig, vercelBlobConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get(CONFIG_KEYS.DATABASE);
        return {
          type: 'postgres',
          host: dbConfig.host || undefined,
          port: dbConfig.port,
          database: dbConfig.name,
          username: dbConfig.username,
          password: dbConfig.password,
          autoLoadEntities: true,
          synchronize:
            configService.get(`${CONFIG_KEYS.APP}.env`) !== 'production', // From user feedback
        };
      },
    }),
    UsersModule,
    NotesModule,
    SpacesModule,
    AuthModule,
    SharedModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
