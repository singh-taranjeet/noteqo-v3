export const MEDIA_API_ROUTES = {
  UPLOAD: "/media",
  DELETE: (mediaId: string) => `/media/${mediaId}`,
} as const;
