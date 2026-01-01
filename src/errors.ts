export * as net from "./errors/net.js";
export * as basic from "./errors/basic.js";

import * as basic from "./errors/basic.js";
import { ERR } from "./utility/LogMessage.js";

// TODO: DELETE
export { default as GroupMeMessageParseError } from "./errors/GroupMeMessageParseError.js";
export { default as GroupMeMessageFetchError } from "./errors/GroupMeMessageFetchError.js";
export { default as ConfigurationError } from "./errors/ConfigurationError.js";

export function assertValid(err: unknown): asserts err is basic.SanitizedError {
  if (!(err instanceof basic.SanitizedError)) {
    ERR(err);
    throw new basic.Uncaught("Unexpected non-Error error.");
  }
}
