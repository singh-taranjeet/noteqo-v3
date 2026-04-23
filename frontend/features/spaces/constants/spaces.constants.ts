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
} as const;

export const SPACES_QUERY_KEY = ["spaces"] as const;
