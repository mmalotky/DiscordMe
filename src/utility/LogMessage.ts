/** Console Logging Utility functions */

import * as Env from "./Env.js";

export function ERR(message: unknown) {
  const m = (message as Error).message
    ? (message as Error).message
    : (message as string);
  console.error(`[ERR] ${Env.sanitize(m)}`);
}

export function INFO(message: unknown) {
  const m = (message as Error).message
    ? (message as Error).message
    : (message as string);
  console.info(`[INFO] ${Env.sanitize(m)}`);
}

export function WARN(message: unknown) {
  const m = (message as Error).message
    ? (message as Error).message
    : (message as string);
  console.warn(`[WARN] ${Env.sanitize(m)}`);
}
