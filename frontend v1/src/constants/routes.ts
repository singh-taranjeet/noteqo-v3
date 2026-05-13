export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  NOTES: "/notes",
  NOTE: (id: string) => `/notes/${id}`,
} as const;
