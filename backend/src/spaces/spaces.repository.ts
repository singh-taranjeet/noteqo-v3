import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SpaceEntity } from './entities/space.entity';
import { SpaceMemberEntity } from './entities/space-member.entity';
import { SpaceKeySlotEntity } from './entities/space-key-slot.entity';
import {
  Space,
  SpaceRole,
  SpaceMember,
  SpaceKeySlot,
} from './types/spaces.types';
import { SPACE_ROLE, SPACE_TYPE } from './constants/spaces.constants';
import { getCurrentUserId } from '../shared/utils/cls.utils';
import { Brackets } from 'typeorm';

@Injectable()
export class SpacesRepository {
  private readonly logger = new Logger(SpacesRepository.name);
  constructor(
    @InjectRepository(SpaceEntity)
    private readonly spaceOrm: Repository<SpaceEntity>,
    @InjectRepository(SpaceMemberEntity)
    private readonly memberOrm: Repository<SpaceMemberEntity>,
    @InjectRepository(SpaceKeySlotEntity)
    private readonly keySlotOrm: Repository<SpaceKeySlotEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a space with the owner as the first member and their key slot.
   * All three inserts (space, member, key slot) are atomic.
   */
  async createWithOwner(
    id: string,
    encryptedName: Buffer,
    type: string,
    ownerKeySlot: Buffer,
  ): Promise<Space> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const currentUserId = getCurrentUserId();

      // The space to be created is private and user does not have any private space, mark it as default true
      let isDefault = false;
      if (type === SPACE_TYPE.PERSONAL) {
        const existingPrivateSpace = await queryRunner.manager
          .createQueryBuilder(SpaceEntity, 'space')
          .innerJoin('space.members', 'member', 'member.userId = :userId', {
            userId: currentUserId,
          })
          .where('space.type = :type', { type: SPACE_TYPE.PERSONAL })
          .getOne();

        if (!existingPrivateSpace) {
          isDefault = true;
        }
      }

      // 1. Create the space
      const space = queryRunner.manager.create(SpaceEntity, {
        id,
        encryptedName,
        type,
        isDefault,
      });
      const savedSpace = await queryRunner.manager.save(SpaceEntity, space);

      // 2. Create owner membership
      const member = queryRunner.manager.create(SpaceMemberEntity, {
        spaceId: savedSpace.id,
        userId: currentUserId,
        role: SPACE_ROLE.OWNER,
      });
      await queryRunner.manager.save(SpaceMemberEntity, member);

      // 3. Create owner's key slot
      const keySlot = queryRunner.manager.create(SpaceKeySlotEntity, {
        spaceId: savedSpace.id,
        userId: currentUserId,
        encryptedSpaceKey: ownerKeySlot,
      });
      await queryRunner.manager.save(SpaceKeySlotEntity, keySlot);

      await queryRunner.commitTransaction();

      return (await this.findById(savedSpace.id)) as Space;
    } catch (err) {
      this.logger.error('Create space failed', err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Returns all spaces the user is a member of.
   */
  async findAllForUser(): Promise<Space[]> {
    const userId = getCurrentUserId(); // Add 'await' if this is an async function

    const entities = await this.spaceOrm
      .createQueryBuilder('space')
      // 1. INNER JOIN is correct here: Only get spaces where the user is actually a member
      .innerJoinAndSelect(
        'space.members',
        'member',
        'member.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect('space.notes', 'note')
      .leftJoinAndSelect(
        'space.keySlots',
        'keySlot',
        'keySlot.userId = :userId',
      )
      .orderBy('space.updatedAt', 'DESC')
      .getMany();

    return entities.map((e) => this.toDomain(e));
  }

  async findAllRecentlyUpdatedNotes(lastUpdated: Date) {
    const currentUserId = getCurrentUserId();

    const entities = await this.spaceOrm
      .createQueryBuilder('space')
      // 1. ACCESS CONTROL: Inner join to ensure the user belongs to the space,
      // but don't select it here so it doesn't mess with our payload.
      .innerJoin(
        'space.members',
        'accessMember',
        'accessMember.userId = :userId',
        { userId: currentUserId },
      )
      // 2. FETCH MEMBERS: Left join to grab the members of the space
      .leftJoinAndSelect('space.members', 'member')
      // 3. FETCH NOTES: Left join to grab ONLY notes that were recently updated
      .leftJoinAndSelect(
        'space.notes',
        'note',
        'note.updatedAt > :lastUpdated AND note.updatedBy != :userId',
      )
      // 4. FETCH KEYSLOTS
      .leftJoinAndSelect(
        'space.keySlots',
        'keySlot',
        'keySlot.userId = :userId',
      )
      // 5. FILTERING: Only return the Space if the Space itself, a Note, or a Member was updated
      .where(
        new Brackets((qb) => {
          qb.where('space.updatedAt > :lastUpdated')
            .orWhere('note.id IS NOT NULL') // True if our left join condition on notes found a match
            .orWhere('member.updatedAt > :lastUpdated');
        }),
      )
      .setParameters({ lastUpdated, userId: currentUserId })
      .orderBy('space.updatedAt', 'DESC')
      .getMany();

    return entities.map((e) => this.toDomain(e));
  }

  /**
   * Fetches a space by ID with members and key slots.
   */
  async findById(id: string): Promise<Space | null> {
    const entity = await this.spaceOrm.findOne({
      where: { id },
      relations: ['members', 'keySlots'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  /**
   * Adds a member and their key slot to a space atomically.
   */
  async addMember(
    spaceId: string,
    userId: string,
    role: string,
    encryptedSpaceKey: Buffer,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const member = queryRunner.manager.create(SpaceMemberEntity, {
        spaceId,
        userId,
        role,
      });
      await queryRunner.manager.save(SpaceMemberEntity, member);

      const keySlot = queryRunner.manager.create(SpaceKeySlotEntity, {
        spaceId,
        userId,
        encryptedSpaceKey,
      });
      await queryRunner.manager.save(SpaceKeySlotEntity, keySlot);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Removes a member and their key slot from a space atomically.
   */
  async removeMember(spaceId: string, userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(SpaceKeySlotEntity, {
        spaceId,
        userId,
      });
      await queryRunner.manager.delete(SpaceMemberEntity, {
        spaceId,
        userId,
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Returns all members for a given space.
   */
  async findMembers(spaceId: string): Promise<SpaceMember[]> {
    const entities = await this.memberOrm.find({
      where: { spaceId },
      relations: ['user'],
    });
    return entities.map((e) => ({
      spaceId: e.spaceId,
      userId: e.userId,
      role: e.role as SpaceRole,
      user: e.user ? { name: e.user.name, email: e.user.email } : undefined,
    }));
  }

  /**
   * Returns a single membership record.
   */
  async findMember(
    spaceId: string,
    userId: string,
  ): Promise<SpaceMember | null> {
    const entity = await this.memberOrm.findOne({ where: { spaceId, userId } });
    if (!entity) return null;
    return {
      spaceId: entity.spaceId,
      userId: entity.userId,
      role: entity.role as SpaceRole,
    };
  }

  /**
   * Returns a user's key slot for a given space.
   */
  async findKeySlot(
    spaceId: string,
    userId: string,
  ): Promise<SpaceKeySlot | null> {
    const entity = await this.keySlotOrm.findOne({
      where: { spaceId, userId },
    });
    if (!entity) return null;
    return {
      spaceId: entity.spaceId,
      userId: entity.userId,
      encryptedSpaceKey: entity.encryptedSpaceKey.toString('base64'),
    };
  }

  /**
   * Updates the encrypted name of a space.
   */
  async updateName(id: string, encryptedName: Buffer): Promise<Space> {
    const currentUserId = getCurrentUserId();
    await this.spaceOrm.update(id, {
      encryptedName,
      updatedBy: currentUserId,
    });
    return (await this.findById(id)) as Space;
  }

  /**
   * Soft-deletes a space.
   */
  async delete(id: string): Promise<void> {
    await this.spaceOrm.softDelete(id);
  }

  /**
   * Maps entity to domain type. Entity shape never leaks outside the repository.
   */
  private toDomain(entity: SpaceEntity): Space {
    return {
      id: entity.id,
      encryptedName: entity.encryptedName.toString('utf8'),
      type: entity.type as Space['type'],
      isDefault: entity.isDefault,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      deletedBy: entity.deletedBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      members: entity.members?.map((m) => ({
        spaceId: m.spaceId,
        userId: m.userId,
        role: m.role as SpaceRole,
      })),
      keySlots: entity.keySlots?.map((ks) => ({
        spaceId: ks.spaceId,
        userId: ks.userId,
        encryptedSpaceKey: ks.encryptedSpaceKey.toString('base64'),
      })),
      notes: entity?.notes?.map((note) => {
        return {
          ...note,
          ciphertext: note.ciphertext.toString('utf8'),
        };
      }),
    };
  }
}
