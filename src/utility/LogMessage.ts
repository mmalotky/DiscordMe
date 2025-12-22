/** Console Logging Utility functions */

export function ERR(message: unknown) {
  const m = message as string;
  console.error(`[ERR] ${m}`);
}

export function INFO(message: string) {
  console.info(`[INFO] ${message}`);
}

export function WARN(message: unknown) {
  const m = message as string;
  console.warn(`[WARN] ${m}`);
}
