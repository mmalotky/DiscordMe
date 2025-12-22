/**
 * Commands Handler. Manage and register bot commands
 *
 * @param gmController - GroupMeController
 */

import { INFO, ERR } from "~/utility/LogMessage.js";
import dotenv from "dotenv";
import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import Command from "~/commands/Command.js";
import GroupMeController from "~/handlers/GroupMeController.js";
import { default as GMCommands } from "~/commands/GM.js";

const commands: Command[] = [];
const commandsJSON: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const rest = new REST({ version: "10" });

/**
 * Initializes the handler
 */
export function init(gmController: GroupMeController) {
  INFO("Initializing ");
  dotenv.config();
  const gm = new GMCommands(gmController);
  commands.length = 0;
  commands.push(gm);
  commands.length = 0;
  commandsJSON.push(gm.getData().toJSON());

  if (process.env.DISCORD_TOKEN) {
    rest.setToken(process.env.DISCORD_TOKEN);
  } else ERR("No discord token found");
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

      console.log("[INFO]...Commands Registered");
    } else ERR("Client/ Server ID's not Found");
  } catch (err) {
    ERR(err);
  }
}
