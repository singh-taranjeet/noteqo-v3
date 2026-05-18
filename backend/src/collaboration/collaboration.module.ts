import { Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CollaborationGateway } from './collaboration.gateway';
import { CollaborationController } from './collaboration.controller';
import { CollaborationService } from './collaboration.service';
import { CollaborationRepository } from './collaboration.repository';
import { YjsUpdateEntity } from './entities/yjs-update.entity';
import { CONFIG_KEYS } from '../config';

@Module({
  imports: [
    TypeOrmModule.forFeature([YjsUpdateEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get(`${CONFIG_KEYS.JWT}.secret`),
      }),
    }),
  ],
  controllers: [CollaborationController],
  providers: [
    CollaborationGateway,
    CollaborationService,
    CollaborationRepository,
  ],
  exports: [CollaborationService],
})
export class CollaborationModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly collaborationService: CollaborationService) {}

  onModuleInit(): void {
    this.collaborationService.startCleanupScheduler();
  }

  onModuleDestroy(): void {
    this.collaborationService.stopCleanupScheduler();
  }
}
