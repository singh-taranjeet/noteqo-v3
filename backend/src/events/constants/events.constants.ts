export const EVENTS_CONFIG = {
  /** Redis Pub/Sub channel prefix. Full channel: `space:{spaceId}:events` */
  CHANNEL_PREFIX: 'space',
  CHANNEL_SUFFIX: 'events',

  /** SSE keep-alive interval in milliseconds */
  SSE_KEEPALIVE_MS: 30_000,
} as const;

export const EVENTS_ROUTES = {
  BASE: 'events',
  STREAM: 'stream',
} as const;
