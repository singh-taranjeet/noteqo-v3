import type { SpaceType, SpaceRole } from '../types/spaces.types';

export class SpaceKeySlotResponseDto {
  userId: string;
  encryptedSpaceKey: string; // base64
}

export class SpaceMemberResponseDto {
  userId: string;
  role: SpaceRole;
}

export class SpaceResponseDto {
  id: string;
  encryptedName: string; // base64
  type: SpaceType;
  isDefault: boolean;
  createdBy: string;
  updatedBy?: string;
  deletedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
  members?: SpaceMemberResponseDto[];
  keySlots?: SpaceKeySlotResponseDto[];
}

export class SpaceNotesResponseDto {
  spaceId: string;
  encryptedSpaceKey: string; // base64 — the requesting user's key slot
  notes: SpaceNoteItemDto[];
}

export class SpaceNoteItemDto {
  id: string;
  ciphertext: string; // base64
  version: number;
  spaceId: string;
  type: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
}
