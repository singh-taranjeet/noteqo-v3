import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { SyncModule } from './sync/sync.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
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
          url: dbConfig.url || undefined,
          host: !dbConfig.url ? dbConfig.host || undefined : undefined,
          port: !dbConfig.url ? dbConfig.port : undefined,
          database: !dbConfig.url ? dbConfig.name : undefined,
          username: !dbConfig.url ? dbConfig.username : undefined,
          password: !dbConfig.url ? dbConfig.password : undefined,
          ssl:
            dbConfig.url && dbConfig.url.includes('sslmode=require')
              ? { rejectUnauthorized: false }
              : undefined,
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
    SyncModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
