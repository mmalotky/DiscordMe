/** Console Logging Utility functions */

export function ERR(message: string) {
  const m = message;
  console.error(`[ERR] ${m}`);
}

export function INFO(message: string) {
  console.info(`[INFO] ${message}`);
}

export function WARN(message: string) {
  const m = message;
  console.warn(`[WARN] ${m}`);
}
