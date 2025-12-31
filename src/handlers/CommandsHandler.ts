/**
 * Commands Handler. Manage and register bot commands
 *
 */

import { INFO, ERR } from "~/utility/LogMessage.js";
import * as DiscordJs from "discord.js";
import * as Discord from "~/discord.js";
import { ConfigurationError } from "~/errors.js";

const commands: Discord.Commands.ICommand[] = [];
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
  const gm = new Discord.Commands.GM();
  commands.length = 0;
  commands.push(gm);
  commandsJSON.length = 0;
  commandsJSON.push(gm.getData().toJSON());
}

/** Returns the list of commands */
export function get(): readonly Discord.Commands.ICommand[] {
  return commands;
}

/** Sends list of commands to Discord. Should be used during start up. */
export async function register() {
  INFO("Registering commands...");

  if (!process.env.CLIENT_ID || !process.env.SERVER_ID)
    throw new ConfigurationError("Missing environment variable.");

  try {
    await rest.put(
      DiscordJs.Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.SERVER_ID,
      ),
      { body: commandsJSON },
    );
    INFO("...Commands Registered");
  } catch (err) {
    ERR("Client/ Server ID's not Found");
    throw err;
  }
}
