export const QueryKeys = {
  notes: {
    remoteNoteId: (id: string) => ["remoteNoteId", id] as const,
    localNoteId: (id: string) => ["localNoteId", id] as const,
    allLocalNotes: ["allLocalNotes"] as const,
    allNotesOfSpace: (spaceId: string) => ["allNotesOfSpace", spaceId] as const,
  },
  space: {
    lists: () => ["space", "list"] as const,
    detail: (id: string) => ["space", "detail", id] as const,
    notes: (spaceId: string) =>
      [...QueryKeys.space.detail(spaceId), "notes"] as const,
    members: (spaceId: string) =>
      [...QueryKeys.space.detail(spaceId), "members"] as const,
    allRecentlyUpdated: ["allRecentlyUpdated"] as const,
  },
};
