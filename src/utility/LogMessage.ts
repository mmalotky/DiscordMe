/** Console Logging Utility functions */

export function ERR(message: unknown) {
  console.error(`[ERR] ${message}`);
}

export function INFO(message: string) {
  console.info(`[INFO] ${message}`);
}

export function WARN(message: unknown) {
  console.warn(`[WARN] ${message}`);
}
