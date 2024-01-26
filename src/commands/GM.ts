import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import Command from "./Command.js";

export default class GM implements Command {
    private data = new SlashCommandBuilder()
        .setName("gm")
        .setDescription("GroupMe Bot controller")
        .addSubcommand(sub => {
            return sub.setName("config")
                .setDescription("Configure a discord text channel")
        });

    getData() { return this.data; }
    
    async execute(interaction:ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();
        if( subcommand === "config") {

        }
        else {
            interaction.reply({
                content: `Subcommand "${subcommand}" not recognised.`,
                ephemeral: true
            });
        }
    }
}