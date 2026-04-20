export const logService = {
  log: (...args: unknown[]) => {
    console.log(...args);
  },
  error: (message: unknown) => {
    console.error(`Error logged ${message}`);
  },
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },
};
