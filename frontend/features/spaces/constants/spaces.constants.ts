export const SPACE_TYPE = {
  PERSONAL: "personal",
  SHARED: "shared",
} as const;

export const SPACE_DEFAULTS = {
  NAME: "My Notes",
} as const;

export const SPACES_API_ROUTES = {
  SPACES: "/spaces",
  SPACE_BY_ID: (spaceId: string) => `/spaces/${spaceId}`,
  SPACE_NOTES: (spaceId: string) => `/spaces/${spaceId}/notes`,
  SPACE_NOTE: (spaceId: string, noteId: string) =>
    `/spaces/${spaceId}/notes/${noteId}`,
  MEMBERS: (spaceId: string) => `/spaces/${spaceId}/members`,
  MEMBER: (spaceId: string, userId: string) =>
    `/spaces/${spaceId}/members/${userId}`,

  ALL_RECENTLY_UPDATED_NOTES: "/spaces/recently/updated-notes",
  syck: "sync",
} as const;

export const SYNC_API_ROUTES = {
  SYNC: "sync",
} as const;

export const SPACES_MESSAGES = {
  INVITE_FAILED: "Failed to invite member",
  MISSING_PUBLIC_KEY: "Public key not found — cannot encrypt space key",
  MISSING_PRIVATE_KEY: "Missing keys — cannot decrypt space key",
} as const;

export const NOTE_FALLBACKS = {
  TITLE: "Untitled",
  EMOJI: "📄",
  COVER_IMAGE: "",
} as const;

export const LOCAL_STORAGE_ALL_SPACES_INITIALLY_FETCHED =
  "LOCAL_STORAGE_ALL_SPACES_INITIALLY_FETCHED";
