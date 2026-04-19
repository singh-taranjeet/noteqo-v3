export const logService = {
  log: (...args: unknown[]) => {
    console.log(...args);
  },
  error: (message: string) => {
    console.error(`Error logged ${message}`);
  },
};
