/** Shared timeout and debounce numbers for the editor */
export const EDITOR_CONFIG = {
  AUTOSAVE_DEBOUNCE_MS: 500,
  SCROLL_DEBOUNCE_MS: 150,
  UPLOAD_CHECK_DELAY_MS: 500,
  EVENT_LOOP_DEFER_MS: 0,
} as const;

/** Custom DOM event dispatched after a version restore completes */
export const VERSION_RESTORED_EVENT = "noteqo:version-restored" as const;
