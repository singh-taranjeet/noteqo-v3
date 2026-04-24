/** Server-only configuration for Next.js Route Handlers (API proxy layer). */

/**
 * Base URL for the backend API, used exclusively by Route Handlers
 * running on the server. NOT prefixed with NEXT_PUBLIC_ — never exposed
 * to the client bundle.
 */
export const BACKEND_BASE_URL =
  process.env.BACKEND_URL ?? "http://localhost:5555";

/** Cache durations for server-side proxy responses (in seconds). */
export const PROXY_CACHE_CONFIG = {
  /** How long to serve cached data before revalidating (seconds). */
  STALE_WHILE_REVALIDATE_S: 120,
  /** Max-age for notes list (short — changes frequently). */
  NOTES_LIST_MAX_AGE_S: 10,
  /** Max-age for a single note detail (short — could be edited). */
  NOTE_DETAIL_MAX_AGE_S: 5,
  /** Max-age for spaces list (medium — changes less often). */
  SPACES_LIST_MAX_AGE_S: 30,
  /** Max-age for space members (medium). */
  SPACE_MEMBERS_MAX_AGE_S: 30,
} as const;
