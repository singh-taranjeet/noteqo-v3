/** localStorage key used to persist the Tiptap editor JSON state. */
export const EDITOR_STORAGE_KEY = "noteqo-editor-state" as const;

/** Shared timeout and debounce numbers for the editor */
export const EDITOR_CONFIG = {
  AUTOSAVE_DEBOUNCE_MS: 500,
  SCROLL_DEBOUNCE_MS: 150,
  UPLOAD_CHECK_DELAY_MS: 500,
  EVENT_LOOP_DEFER_MS: 0,
} as const;
