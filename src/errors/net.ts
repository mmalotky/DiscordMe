/**
 * net.ts
 *
 * Errors in this file should be all that is returned from networking modules.
 *
 * Barring the unexpected, this is an exhaustive list of expected behaviors
 * from networking modules.
 */

import { SanitizedError } from "./basic.js";

const ERROR_API_PREFIX = "Errors.net";

/**
 * Errors when connecting to a resource.
 *
 * Should indicated a problem with the actual fetch, not with the response.
 *
 * For example, a failure to connect should result in a `Fetch` error.
 */
export class Connection extends SanitizedError {
  constructor(url: string) {
    super(`Unable to connect to ${url}`);
    this.name = `${ERROR_API_PREFIX}.Connection`;
  }
}

/**
 * Errors when parsing a network response.
 *
 * Not to be confused with parsing the data within the response, this error
 * is thrown when the data does not match the expected structure. Namely,
 * when the JSON schema is incorrect.
 */
export class Parse extends SanitizedError {
  constructor(url: string) {
    super(`Unable to parse data returned from ${url}`);
    this.name = `${ERROR_API_PREFIX}.Parse`;
  }
}

/**
 * Errors caused by a rate limited response.
 *
 * This should trigger a log message and a re-attempt after sleeping.
 */
export class RateLimited extends SanitizedError {
  constructor(url: string) {
    super(`Rate limited at ${url}`);
    this.name = `${ERROR_API_PREFIX}.RateLimited`;
  }
}

/**
 * Errors caused by valid credentials with bad permissions
 *
 * This is typically HTTP 403
 */
export class Forbidden extends SanitizedError {
  constructor(url: string) {
    super(`Forbidden ${url}`);
    this.name = `${ERROR_API_PREFIX}.Forbidden`;
  }
}

/**
 * Errors caused by invalid or missing credentials.
 *
 * This is typically HTTP 401.
 */
export class Unauthorized extends SanitizedError {
  constructor(url: string) {
    super(`Failed to authenticate: ${url}`);
    this.name = `${ERROR_API_PREFIX}.Unauthorized`;
  }
}

/**
 * Errors caused by missing a resource.
 *
 * This is typically HTTP 404.
 *
 * Handle as situationally appropriate.
 */
export class NotFound extends SanitizedError {
  constructor(url: string) {
    super(`Not Found: ${url}`);
    this.name = `${ERROR_API_PREFIX}.NotFound`;
  }
}
