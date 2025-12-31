/**
 * Commands Handler. Manage and register bot commands
 *
 */

import { INFO, ERR } from "~/utility/LogMessage.js";
import * as DiscordJs from "discord.js";
import Command from "~/commands/Command.js";
import { default as GMCommands } from "~/commands/GM.js";
import { Env } from "~/utility.js";

const commands: Command[] = [];
const commandsJSON: DiscordJs.RESTPostAPIChatInputApplicationCommandsJSONBody[] =
  [];
const rest = new DiscordJs.REST({ version: "10" });

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
export async function register() {
  Env.init();

  INFO("Registering commands...");
  const clientId = Env.getRequired(Env.REQUIRED.CLIENT_ID);
  const serverId = Env.getRequired(Env.REQUIRED.SERVER_ID);

  try {
    await rest.put(
      DiscordJs.Routes.applicationGuildCommands(clientId, serverId),
      { body: commandsJSON },
    );
    INFO("...Commands Registered");
  } catch (err) {
    ERR("Client/ Server ID's not Found");
    throw err;
  }
}
