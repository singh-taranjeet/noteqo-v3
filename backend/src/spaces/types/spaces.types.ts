import { SPACE_TYPE, SPACE_ROLE } from '../constants/spaces.constants';

// ─── Union Types (derived from const objects per NestJS rules §16) ───────────

export type SpaceType = (typeof SPACE_TYPE)[keyof typeof SPACE_TYPE];
export type SpaceRole = (typeof SPACE_ROLE)[keyof typeof SPACE_ROLE];

// ─── Domain Interfaces ──────────────────────────────────────────────────────

export interface Space {
  id: string;
  encryptedName: string;
  type: SpaceType;
  isDefault: boolean;
  createdBy: string;
  updatedBy?: string;
  deletedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
  members?: SpaceMember[];
  keySlots?: SpaceKeySlot[];
}

export interface SpaceMember {
  spaceId: string;
  userId: string;
  role: SpaceRole;
  user?: {
    name: string;
    email: string;
  };
}

export interface SpaceKeySlot {
  spaceId: string;
  userId: string;
  encryptedSpaceKey: string;
}
