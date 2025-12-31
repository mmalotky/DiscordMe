import * as dotenv from "dotenv";
import { ConfigurationError } from "~/errors.js";

let isLoaded: boolean | null;

export enum REQUIRED {
  GROUPME_TOKEN = "GROUPME_TOKEN",
  DISCORD_TOKEN = "DISCORD_TOKEN",
  CLIENT_ID = "CLIENT_ID",
  SERVER_ID = "SERVER_ID",
}

export enum OPTIONAL {
  TEST_DISCORD_CHANNEL_ID = "TEST_DISCORD_CHANNEL_ID",
  TEST_GROUPME_GROUP_ID = "TEST_GROUPME_GROUP_ID",
  CI = "CI",
}

function assertRequired() {
  Object.keys(REQUIRED).forEach((key: string) => {
    if (!process.env[key])
      throw new ConfigurationError(
        `Required environment variable ${key} not found!`,
      );
  });
}

export function init() {
  if (isLoaded) return;
  isLoaded = true;
  dotenv.config();
  assertRequired();
}

function assertLoaded() {
  if (!isLoaded)
    throw new ConfigurationError(
      "Attempted to fetch an environment variable before loading .env",
    );
}

export function getRequired(key: REQUIRED | OPTIONAL): string {
  assertLoaded();
  const result = process.env[key];
  if (!result)
    throw new ConfigurationError(
      `Required environment variable ${key} not found!`,
    );

  return result;
}

export function getOptional(key: OPTIONAL): string | undefined {
  assertLoaded();
  return process.env[key];
}
