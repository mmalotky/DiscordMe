import * as DiscordJS from "discord.js";

export interface ICommand {
  /**
   * Discord Command Interface.
   * getData returns a command's metadata and descriptors
   * execute runs an asynchronous response to a client iteration
   */

  getData: () =>
    | DiscordJS.SlashCommandBuilder
    | DiscordJS.SlashCommandSubcommandsOnlyBuilder;
  execute: (
    interaction: DiscordJS.ChatInputCommandInteraction<DiscordJS.CacheType>,
  ) => Promise<void>;
}
