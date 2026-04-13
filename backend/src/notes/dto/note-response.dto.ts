export class KeySlotResponseDto {
  userId: string;
  encryptedDocKey: string; // base64
}

export class NoteResponseDto {
  id: string;
  ciphertext: string; // base64
  version: number;
  createdBy: string;
  updatedBy?: string;
  deletedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
  keySlots?: KeySlotResponseDto[];
}
