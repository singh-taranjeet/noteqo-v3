import { db } from '@/features/storage';
import type { Document } from '../types/workspace.types';
import {
  DOCUMENT_DEFAULTS,
  DOCUMENT_EMOJI_POOL,
  DOCUMENT_COVER_POOL,
} from '../constants/workspace.constants';
import { syncQueueService } from './sync-queue.service';

function getRandomItem<T>(pool: readonly T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

export const documentService = {
  /**
   * Creates a new document locally in Dexie and enqueues a CREATE sync event.
   * Returns the document immediately — no network call.
   */
  async createDocument(title?: string): Promise<Document> {
    const now = new Date().toISOString();
    const document: Document = {
      id: crypto.randomUUID(),
      title: title ?? DOCUMENT_DEFAULTS.TITLE,
      emoji: getRandomItem(DOCUMENT_EMOJI_POOL),
      coverImage: getRandomItem(DOCUMENT_COVER_POOL),
      content: null,
      syncStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    await db.documents.put(document);
    await syncQueueService.enqueue('CREATE', document.id, document);

    return document;
  },

  /**
   * Returns all documents from the local Dexie DB.
   */
  async getAllDocuments(): Promise<Document[]> {
    return db.documents.orderBy('updatedAt').reverse().toArray();
  },

  /**
   * Returns a single document by ID from the local Dexie DB.
   */
  async getDocument(id: string): Promise<Document | undefined> {
    return db.documents.get(id);
  },

  /**
   * Updates a document locally and enqueues an UPDATE sync event.
   */
  async updateDocument(id: string, updates: Partial<Omit<Document, 'id' | 'createdAt'>>): Promise<void> {
    const patched = { ...updates, updatedAt: new Date().toISOString(), syncStatus: 'pending' as const };
    await db.documents.update(id, patched);

    const document = await db.documents.get(id);
    if (document) {
      await syncQueueService.enqueue('UPDATE', id, document);
    }
  },

  /**
   * Marks a document as deleted locally and enqueues a DELETE sync event.
   */
  async deleteDocument(id: string): Promise<void> {
    await db.documents.delete(id);
    await syncQueueService.enqueue('DELETE', id, { id });
  },
};
