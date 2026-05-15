const isDev = __DEV__;

export const logger = {
  log: (...args: any[]) => {
    if (isDev) console.log("[PixelLoad]", ...args);
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn("[PixelLoad] WARN:", ...args);
  },
  error: (...args: any[]) => {
    if (isDev) console.error("[PixelLoad] ERROR:", ...args);
  },
  ai: (...args: any[]) => {
    if (isDev) console.log("⚡ [Visionco AI]", ...args);
  }
};
