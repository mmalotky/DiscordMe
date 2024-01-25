import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default interface Command {
    getData: () => SlashCommandBuilder
    execute: (interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>;
}