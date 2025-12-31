const ERROR_API_PREFIX = "Errors.basic";
import { Env } from "~/utility.js";

export class SanitizedError extends Error {
  constructor(message: string) {
    message = Env.sanitize(message);
    super(message);
  }
}

/**
 * Configuration errors. If the bot may fail to initialize for any reason, throw this.
 */
export class Configuration extends SanitizedError {
  constructor(message: string) {
    super(message);
    this.name = `${ERROR_API_PREFIX}.Configuration`;
  }
}

/**
 * Intentionally unhandled errors. Throw this if you want to program to exit with an error immediately.
 */
export class Fatal extends SanitizedError {
  constructor(message: string) {
    super(message);
    this.name = `${ERROR_API_PREFIX}.Fatal`;
  }
}

/**
 * Wraps unexpected errors. Should bubble up and cause a graceful crash similar to fatal errors.
 */
export class Uncaught extends SanitizedError {
  constructor(message: string) {
    super(message);
    this.name = `${ERROR_API_PREFIX}.Uncaught`;
  }
}

/**
 * Errors caused by more resources than expected..
 *
 * Such as when there's only supposed to be one resource.
 */
export class TooMany extends SanitizedError {
  constructor(match: string) {
    super(`Too many resources found matching: ${match}`);
    this.name = `${ERROR_API_PREFIX}.TooMany`;
  }
}
