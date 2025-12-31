/** Console Logging Utility functions */

export function ERR(message: unknown) {
  const m = (message as Error).message
    ? (message as Error).message
    : (message as string);
  console.error(`[ERR] ${m}`);
}

export function INFO(message: unknown) {
  const m = (message as Error).message
    ? (message as Error).message
    : (message as string);
  console.info(`[INFO] ${m}`);
}

export function WARN(message: unknown) {
  const m = (message as Error).message
    ? (message as Error).message
    : (message as string);
  console.warn(`[WARN] ${m}`);
}
