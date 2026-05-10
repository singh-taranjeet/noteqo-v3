export const QueryKeys = {
  notes: {
    remote: {
      get: (id: string) => ["remoteNoteId", id] as const,
    },
    local: {
      get: (id: string) => ["localNoteId", id] as const,
      all: ["allLocalNotes"] as const,
      allOfSpace: (spaceId: string) => ["allNotesOfSpace", spaceId] as const,
    },
  },
  space: {
    local: {
      getAllLocal: () => ["space", "list", "local"] as const,
      getLocal: (id: string) => ["space", "detail", "local", id] as const,
      spacesAndNote: () => ["space", "note", "list", "local"] as const,
    },
    remote: {
      spacesAndNote: () => ["space", "note", "list", "remote"] as const,
    },
    lists: () => ["space", "list"] as const,
    detail: (id: string) => ["space", "detail", id] as const,
    notes: (spaceId: string) =>
      [...QueryKeys.space.detail(spaceId), "notes"] as const,
    members: (spaceId: string) =>
      [...QueryKeys.space.detail(spaceId), "members"] as const,
    allRecentlyUpdated: ["allRecentlyUpdated"] as const,
  },
};
