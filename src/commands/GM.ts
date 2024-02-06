import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import Command from "./Command.js";
import GroupMeController from "../handlers/GroupMeController.js";
import DataHandler from "../handlers/DataHandler.js";

export default class GM implements Command {
    private gmController:GroupMeController;

    constructor(controller:GroupMeController) {
        this.gmController = controller;
    }

    private data = new SlashCommandBuilder()
        .setName("gm")
        .setDescription("GroupMe Bot controller")
        .addSubcommand(sub => {
            return sub.setName("config")
                .setDescription("Configure a discord text channel")
                .addStringOption(option => {
                    return option.setName("channel")
                        .setRequired(true)
                        .setDescription("Name of GroupMe Channel")
                })
        });

    getData() { return this.data; }
    
    async execute(interaction:ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();
        if( subcommand === "config") {
            this.config(interaction);
        }
        else {
            interaction.reply({
                content: `Subcommand "${subcommand}" not recognised.`,
                ephemeral: true
            });
        }
    }

    private async config(interaction:ChatInputCommandInteraction) {
        const channelName = interaction.options.getString("channel", true);
        const response = await this.gmController.getChannelByName(channelName);

        if(response.length === 0) {
            return interaction.reply({
                content:`No channel found by the name ${channelName}`,
                ephemeral:true
            })
        }
        else if(response.length > 1) {
            return interaction.reply({
                content:"Multiple channels were found. Please select one.",
                ephemeral:true
            })
        }

        const channel = response[0];
        DataHandler.addConfig(interaction.channelId, channel);

        interaction.reply({
            content:`Configured to channel ${channelName}`,
            ephemeral:true
        })
    }
}