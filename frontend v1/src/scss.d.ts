/// <reference types="vite/client" />

// Allow importing .scss modules
declare module "*.scss" {
  const content: string;
  export default content;
}
