export const QUERY_KEYS = {
  space: {
    remote: {
      all: ["space", "remote"] as const,
      spacesAndNote: ["space", "remote", "spaceAndNote"] as const,
      get: (id: string) => ["space", "remote", id] as const,
      notes: (spaceId: string) =>
        ["space", "remote", "notes", spaceId] as const,
      members: (spaceId: string) =>
        ["space", "remote", "members", spaceId] as const,
      allRecentlyUpdated: ["space", "remote", "allRecentlyUpdated"] as const,
    },
  },
  notes: {
    remote: {
      get: (id: string) => ["notes", "remote", id] as const,
    },
  },
} as const;
