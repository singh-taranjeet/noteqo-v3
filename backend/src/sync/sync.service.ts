import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SyncEntity } from './entities/sync.entity';
import { Repository } from 'typeorm';
import { getCurrentUserId } from '../shared/utils/cls.utils';

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(SyncEntity)
    private readonly syncRepository: Repository<SyncEntity>,
  ) {}

  async updateSync() {
    const userId = getCurrentUserId();
    const existingSync = await this.syncRepository.findOne({
      where: { userId },
    });
    if (existingSync) {
      existingSync.updatedAt = new Date();
      await this.syncRepository.save(existingSync);
      return await this.syncRepository.findOne({ where: { userId } });
    } else {
      return await this.syncRepository.insert({ userId });
    }
  }

  getSync() {
    const userId = getCurrentUserId();
    return this.syncRepository.findOne({
      where: { userId },
      select: ['updatedAt'],
    });
  }
}
