/**
 * Query keys for React Query.
 *
 * With the switch to Dexie useLiveQuery for local reads,
 * these keys are only used for remote API operations.
 */
export const QueryKeys = {
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
  remoteSync: ["remote-sync"] as const,
};
