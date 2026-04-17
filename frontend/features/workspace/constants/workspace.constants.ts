export const DOCUMENT_DEFAULTS = {
  TITLE: "Untitled",
} as const;

/** Random emoji assigned on new document creation */
export const DOCUMENT_EMOJI_POOL = [
  "📄",
  "📝",
  "📒",
  "📓",
  "📔",
  "📕",
  "📗",
  "📘",
  "📙",
  "🗒️",
  "🗓️",
  "💡",
  "🎯",
  "🚀",
  "⭐",
  "🔖",
  "📌",
  "🗂️",
  "✨",
  "🌟",
  "💫",
  "🎨",
  "🧩",
  "🔬",
  "🧪",
  "📊",
  "📈",
] as const;

/** Random cover image assigned on new document creation */
export const DOCUMENT_COVER_POOL = [
  "/images/covers/gradient-blue.jpg",
  "/images/covers/gradient-purple.jpg",
  "/images/covers/gradient-orange.jpg",
  "/images/covers/gradient-green.jpg",
  "/images/covers/gradient-pink.jpg",
  "/images/covers/abstract-waves.jpg",
  "/images/covers/abstract-mesh.jpg",
  "/images/covers/nature-mountains.jpg",
  "/images/covers/nature-ocean.jpg",
  "/images/covers/nature-forest.jpg",
] as const;

export const SYNC_CONFIG = {
  INTERVAL_MS: 5000,
  MAX_RETRY_COUNT: 5,
  BASE_BACKOFF_MS: 1000,
} as const;

export const WORKSPACE_API_ROUTES = {
  NOTES: "/notes",
} as const;
