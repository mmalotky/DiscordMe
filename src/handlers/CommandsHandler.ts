/**
 * Commands Handler. Manage and register bot commands
 *
 */

import { INFO, ERR } from "~/utility/LogMessage.js";
import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import Command from "~/commands/Command.js";
import { default as GMCommands } from "~/commands/GM.js";

const commands: Command[] = [];
const commandsJSON: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const rest = new REST({ version: "10" });

export function setToken(token: string | undefined) {
  if (token) {
    rest.setToken(token);
  } else ERR("No discord token found");
}
/**
 * Initializes the handler
 */
export function init() {
  INFO("Initializing ");
  const gm = new GMCommands();
  commands.length = 0;
  commands.push(gm);
  commandsJSON.length = 0;
  commandsJSON.push(gm.getData().toJSON());
}

/** Returns the list of commands */
export function get(): readonly Command[] {
  return commands;
}

/** Sends list of commands to Discord. Should be used during start up. */
export function register() {
  try {
    INFO("Registering commands...");

    if (process.env.CLIENT_ID && process.env.SERVER_ID) {
      rest
        .put(
          Routes.applicationGuildCommands(
            process.env.CLIENT_ID,
            process.env.SERVER_ID,
          ),
          { body: commandsJSON },
        )
        .then(() => INFO("...Commands Registered"))
        .catch(() => {});
    } else ERR("Client/ Server ID's not Found");
  } catch (err) {
    ERR(err);
  }
}
