import { useQuery } from "@tanstack/react-query";
import { storageService, STORAGE_KEYS } from "@/features/storage";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  publicKey: string;
  privateKey?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useUserProfile = () => {
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const user = await storageService.get<UserProfile>(
        STORAGE_KEYS.USER_PROFILE,
      );
      return user;
    },
    // Keep it cached for a long time since it doesn't change often
    staleTime: 1000 * 60 * 60,
  });
};
