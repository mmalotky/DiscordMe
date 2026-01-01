export * as GM from "./commands/GM.js";

import * as GM from "./commands/GM.js";
import * as DiscordJs from "discord.js";

export function build(): DiscordJs.SlashCommandSubcommandsOnlyBuilder[] {
  return [GM.build()];
}

/**
 * Search this mapping to relate a string to a given command's action
 */
export const ExecMapping = {
  [GM.NAME]: GM.execute,
};
