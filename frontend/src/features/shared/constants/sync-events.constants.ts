export const SYNC_EVENTS = {
  TRIGGER_SYNC: "noteqo:trigger-sync",
  CONFLICT_DETECTED: "noteqo:conflict-detected",
  REAL_TIME_EVENT: (type: string) => `noteqo:realtime:${type}`,
  CREATE_CHILD: `noteqo:create-child-note`,
  RESTORE_VERSION: 'noteqo:version-restored'
} as const;
