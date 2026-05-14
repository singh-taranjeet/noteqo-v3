import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import {
  SPACE_ROLE_KEY,
  SpaceRoleOptions,
} from '../../shared/decorators/space-role.decorator';
import { SpaceMemberEntity } from '../../spaces/entities/space-member.entity';
import { NoteEntity } from '../../notes/entities/note.entity';
import { MediaEntity } from '../../media/entities/media.entity';

@Injectable()
export class SpaceRoleGuard implements CanActivate {
  private readonly logger = new Logger(SpaceRoleGuard.name);

  constructor(
    private reflector: Reflector,
    private dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<SpaceRoleOptions>(
      SPACE_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return true; // No SpaceRole decorator, let it pass
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      // JwtAuthGuard should have caught this, but just in case
      return false;
    }

    const spaceIds = await this.extractSpaceIds(request, options.resourceType);

    // If resource is media and spaceId is purely optional for 'findAll', we might have empty spaceIds.
    // In that case, if the controller route depends on spaceId, it would fail here.
    // If it's a valid empty scenario (like getting all user media), we should allow it.
    if (spaceIds.length === 0) {
      // Exception: If it's a GET /media request without spaceId, allow it (handled in controller)
      if (options.resourceType === 'media' && request.method === 'GET') {
        return true;
      }
      this.logger.warn(`SpaceRoleGuard: Could not determine spaceId from request`);
      throw new ForbiddenException('Could not determine space context');
    }

    for (const spaceId of spaceIds) {
      // Look up membership via TypeORM Entity to handle proper column mapping
      const member = await this.dataSource.manager.findOne(SpaceMemberEntity, {
        where: { spaceId, userId: user.id },
      });

      if (!member) {
        this.logger.warn(`User ${user.id} is not a member of space ${spaceId}`);
        throw new ForbiddenException(`Not a member of space ${spaceId}`);
      }

      if (options.roles && options.roles.length > 0) {
        if (!options.roles.includes(member.role as any)) {
          this.logger.warn(
            `User ${user.id} has role ${member.role} which is not sufficient for space ${spaceId}. Required: ${options.roles.join(',')}`,
          );
          throw new ForbiddenException(
            `Insufficient permissions in space ${spaceId}`,
          );
        }
      }
    }

    return true;
  }

  private async extractSpaceIds(
    request: any,
    resourceType: SpaceRoleOptions['resourceType'],
  ): Promise<string[]> {
    if (resourceType === 'space') {
      const id = request.params.spaceId || request.body.spaceId || request.query.spaceId;
      return id ? [id] : [];
    }

    if (resourceType === 'events') {
      const ids = request.query.spaceIds;
      if (!ids) return [];
      return ids.split(',').filter(Boolean);
    }

    if (resourceType === 'note') {
      // Creating a note
      if (request.body.spaceId) return [request.body.spaceId];
      
      // Updating/Deleting a note
      if (request.params.noteId) {
        const note = await this.dataSource.manager.findOne(NoteEntity, {
          where: { id: request.params.noteId },
        });
        if (note && note.spaceId) {
          return [note.spaceId];
        }
      }
      return [];
    }

    if (resourceType === 'media') {
      // Uploading/Registering media
      if (request.body.spaceId) return [request.body.spaceId];
      if (request.query.spaceId) return [request.query.spaceId];

      // Updating/Deleting media
      if (request.params.mediaId) {
        const media = await this.dataSource.manager.findOne(MediaEntity, {
          where: { id: request.params.mediaId },
        });
        if (media && media.spaceId) {
          return [media.spaceId];
        }
      }
      return [];
    }

    return [];
  }
}
