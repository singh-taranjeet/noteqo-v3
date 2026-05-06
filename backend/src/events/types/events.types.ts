/** Entity types that can emit real-time events */
export type EventEntity = 'note' | 'space' | 'media';

/** Event types by entity */
export type NoteEventType =
  | 'NOTE_CREATED'
  | 'NOTE_UPDATED'
  | 'NOTE_DELETED'
  | 'NOTE_RESTORED';

export type SpaceEventType =
  | 'SPACE_UPDATED'
  | 'SPACE_MEMBER_ADDED'
  | 'SPACE_MEMBER_REMOVED';

export type MediaEventType =
  | 'MEDIA_UPLOADED'
  | 'MEDIA_DELETED';

/**
 * Base event published to Redis Pub/Sub.
 * All entity-specific events extend this shape.
 * Does NOT include encrypted payloads — clients fetch the full resource separately.
 */
export interface BaseRealtimeEvent {
  entity: EventEntity;
  type: string;
  spaceId: string;
  updatedBy: string;
  updatedAt: Date;
}

export interface NoteRealtimeEvent extends BaseRealtimeEvent {
  entity: 'note';
  type: NoteEventType;
  noteId: string;
  version: number;
}

export interface SpaceRealtimeEvent extends BaseRealtimeEvent {
  entity: 'space';
  type: SpaceEventType;
  targetUserId?: string;
}

export interface MediaRealtimeEvent extends BaseRealtimeEvent {
  entity: 'media';
  type: MediaEventType;
  mediaId: string;
  noteId: string;
}

/** Union of all real-time event types */
export type RealtimeEvent =
  | NoteRealtimeEvent
  | SpaceRealtimeEvent
  | MediaRealtimeEvent;
