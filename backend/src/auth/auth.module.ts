import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthMiddleware } from './middleware/auth.middleware';
import { CONFIG_KEYS } from '../config';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      global: true, // Configured globally mapping dependency trees
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>(`${CONFIG_KEYS.JWT}.secret`),
        signOptions: {
          expiresIn: configService.get<string>(`${CONFIG_KEYS.JWT}.expiresIn`),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Map the context extraction explicitly bridging identities natively across endpoints globally
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
