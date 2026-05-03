export type SyncStatus = "pending" | "synced" | "failed";
export type SyncEventType = "CREATE" | "UPDATE" | "DELETE";
export type NoteType = "private" | "shared";

export interface Note {
  id: string;
  title: string;
  emoji: string;
  coverImage: string;
  content: unknown;
  syncStatus: SyncStatus;
  spaceId: string;
  parentId?: string;
  type: NoteType;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteTreeNode extends Note {
  children: NoteTreeNode[];
}

export interface SyncEvent {
  id: string;
  type: SyncEventType;
  entityId: string;
  payload: unknown;
  retryCount: number;
  createdAt: string;
}

export interface RemoteNote {
  id: string;
  ciphertext: string;
  version: number;
  spaceId: string;
  type: string;
  isFavorite?: boolean;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RemoteNoteVersion {
  id: string;
  noteId: string;
  version: number;
  ciphertext: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface DecryptedNoteVersion {
  id: string;
  noteId: string;
  version: number;
  title: string;
  emoji: string;
  coverImage: string;
  content: unknown;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}
