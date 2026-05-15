import { SetMetadata } from '@nestjs/common';
import { SpaceRole } from '../../spaces/types/spaces.types';

export const SPACE_ROLE_KEY = 'space_roles';

export interface SpaceRoleOptions {
  /**
   * If provided, the user must have one of these roles in the space.
   * If omitted, any valid space membership is accepted.
   */
  roles?: SpaceRole[];
  /**
   * Defines how to extract the spaceId(s) for the request context.
   * 'space' -> looks for spaceId in params, body, or query
   * 'note' -> looks for noteId in params to lookup spaceId, or spaceId in body
   * 'media' -> looks for mediaId in params to lookup spaceId, or spaceId in body/query
   * 'events' -> looks for spaceIds (comma separated) in query
   */
  resourceType: 'space' | 'note' | 'media' | 'events';
}

export const RequireSpaceRole = (options: SpaceRoleOptions) =>
  SetMetadata(SPACE_ROLE_KEY, options);
