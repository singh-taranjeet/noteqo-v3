export interface KeySlot {
  noteId: string;
  userId: string;
  encryptedDocKey: string;
}

export interface Note {
  id: string;
  ciphertext: string;
  version: number;
  createdBy: string;
  updatedBy?: string;
  deletedBy?: string;
  createdAt: Date;
  updatedAt?: Date;
  keySlots?: KeySlot[];
}
