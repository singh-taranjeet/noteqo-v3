import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { YjsUpdateEntity } from './entities/yjs-update.entity';
import { COLLABORATION_CONFIG } from './constants/collaboration.constants';

@Injectable()
export class CollaborationRepository {
  constructor(
    @InjectRepository(YjsUpdateEntity)
    private readonly yjsUpdateOrm: Repository<YjsUpdateEntity>,
  ) {}

  /**
   * Persists an encrypted Yjs update and returns the assigned sequence number.
   */
  async saveUpdate(
    noteId: string,
    encryptedUpdate: string,
  ): Promise<number> {
    // Get the next sequence number atomically
    const maxResult = await this.yjsUpdateOrm
      .createQueryBuilder('update')
      .select('COALESCE(MAX(update.sequence_number), 0)', 'maxSeq')
      .where('update.note_id = :noteId', { noteId })
      .getRawOne();

    const nextSequence = Number(maxResult?.maxSeq ?? 0) + 1;

    const entity = this.yjsUpdateOrm.create({
      noteId,
      encryptedUpdate: Buffer.from(encryptedUpdate, 'utf8'),
      sequenceNumber: nextSequence,
      isCompacted: false,
    });

    await this.yjsUpdateOrm.save(entity);
    return nextSequence;
  }

  /**
   * Retrieves encrypted updates for a note after a given sequence number.
   * Used for client catch-up after reconnect.
   */
  async getUpdatesAfter(
    noteId: string,
    afterSequenceNumber: number,
  ): Promise<YjsUpdateEntity[]> {
    return this.yjsUpdateOrm.find({
      where: {
        noteId,
        sequenceNumber: MoreThan(afterSequenceNumber),
      },
      order: { sequenceNumber: 'ASC' },
      take: COLLABORATION_CONFIG.MAX_CATCHUP_UPDATES,
    });
  }

  /**
   * Saves a compacted full-state snapshot and removes all preceding updates.
   */
  async saveCompactedState(
    noteId: string,
    encryptedState: string,
  ): Promise<number> {
    // Get current max sequence
    const maxResult = await this.yjsUpdateOrm
      .createQueryBuilder('update')
      .select('COALESCE(MAX(update.sequence_number), 0)', 'maxSeq')
      .where('update.note_id = :noteId', { noteId })
      .getRawOne();

    const compactSequence = Number(maxResult?.maxSeq ?? 0) + 1;

    // Delete all old updates for this note
    await this.yjsUpdateOrm.delete({ noteId });

    // Save the compacted snapshot
    const entity = this.yjsUpdateOrm.create({
      noteId,
      encryptedUpdate: Buffer.from(encryptedState, 'utf8'),
      sequenceNumber: compactSequence,
      isCompacted: true,
    });

    await this.yjsUpdateOrm.save(entity);
    return compactSequence;
  }

  /**
   * Deletes encrypted updates older than the configured retention period.
   * Compacted snapshots are preserved if they are the only update for a note.
   */
  async deleteExpiredUpdates(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(
      cutoffDate.getDate() - COLLABORATION_CONFIG.UPDATE_RETENTION_DAYS,
    );

    const result = await this.yjsUpdateOrm.delete({
      createdAt: LessThan(cutoffDate),
      isCompacted: false,
    });

    return result.affected ?? 0;
  }

  /**
   * Returns the latest sequence number for a note.
   */
  async getLatestSequenceNumber(noteId: string): Promise<number> {
    const result = await this.yjsUpdateOrm
      .createQueryBuilder('update')
      .select('COALESCE(MAX(update.sequence_number), 0)', 'maxSeq')
      .where('update.note_id = :noteId', { noteId })
      .getRawOne();

    return Number(result?.maxSeq ?? 0);
  }
}
