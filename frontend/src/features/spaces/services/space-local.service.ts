import { db } from "@/features/storage";
import type { Space } from "../types/spaces.types";

export const SpaceLocalService = {
    all: async () => {
        return db.spaces.toArray()
    },
    get: async (id: string) => {
        return db.spaces.get(id)
    },
    create: async (space: Space) => {
        await db.spaces.put(space);
    },
    update: async (id: string, space: Space) => {
        await db.spaces.update(id, { ...space });
    },
    delete: async () => { },
    bulkUpdate: async (spaces: Space[]) => {
        await db.spaces.bulkPut(spaces);
    },
    clear: async () => {
        return db.spaces.clear();
    },
    allShared: async () => {
        return db.spaces.where("type").equals("shared").toArray();
    }
}