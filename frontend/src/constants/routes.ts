export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  NOTES: "/notes",
  NOTE: (id: string) => `/notes/${id}`,
  LIBRARY: "/library",
  ASSETS: "/assets",
  TRASH: "/trash",
  SETTINGS: "/settings",
  PROFILE: "/profile",
  SPACE: (id: string) => `/spaces/${id}`,
} as const;
