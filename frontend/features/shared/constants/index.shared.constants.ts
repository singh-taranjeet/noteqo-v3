export const QueryKeys = {
  notes: {
    remote: {
      get: (id: string) => ["notes", "remote", id] as const,
    },
    local: {
      all: ["notes", "local"] as const,
      get: (id: string) => [...QueryKeys.notes.local.all, id] as const,
      allOfSpace: (spaceId: string) =>
        ["notes", "local", "allOfSpace", spaceId] as const,
    },
  },
  space: {
    local: {
      all: ["space", "local"] as const,
      get: (id: string) => ["space", "local", id] as const,
      spacesAndNote: ["space", "local", "spaceAndNote"] as const,
    },
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
};
