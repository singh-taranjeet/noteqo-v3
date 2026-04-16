import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SYNC_ROUTES } from './constants/sync.constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller(SYNC_ROUTES.BASE)
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post()
  async updateSync() {
    return this.syncService.updateSync();
  }

  @Get()
  async getSync() {
    return this.syncService.getSync();
  }
}
