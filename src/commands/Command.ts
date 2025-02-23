import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

export default interface Command {
    /**
     * Discord Command Interface.
     * getData returns a command's metadata and descriptors
     * execute runs an asyncronous responce to a client interation
     */

    getData: () => SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder
    execute: (interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>;
}