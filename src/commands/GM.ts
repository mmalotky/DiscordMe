import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import Command from "./Command.js";
import GroupMeController from "../handlers/GroupMeController.js";
import DataHandler from "../handlers/DataHandler.js";
import { parceDiscordMessage } from "../utility/MessageParcer.js";

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
        })
        .addSubcommand(sub => {
            return sub.setName("setconfig")
                .setDescription("Change configuration")
                .addStringOption(option => {
                    return option.setName("channel")
                        .setRequired(true)
                        .setDescription("Name of GroupMe Channel")
                })
        })
        .addSubcommand(sub => {
            return sub.setName("getconfig")
                .setDescription("Get the current configuration");
        })
        .addSubcommand(sub => {
            return sub.setName("update")
                .setDescription("Get messages since last update");
        });

    getData() { return this.data; }
    
    async execute(interaction:ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();
        switch(subcommand) {

            case("config"): 
                this.config(interaction);
                break;

            case("setconfig"): 
                this.setConfig(interaction);
                break;

            case("getconfig"):
                this.getConfig(interaction);
                break;

            case("update"):
                this.update(interaction);
                break;

            default: interaction.reply({
                content: `Subcommand "${subcommand}" not recognised.`,
                ephemeral: true
            });
        }
    }
    private async update(interaction: ChatInputCommandInteraction) {
        const channel = await DataHandler.getConfig(interaction.channelId);
        if(!channel) return;

        const messages = await this.gmController.getMessages(channel);
        for(const message of messages) {
            const payload = parceDiscordMessage(message);
            interaction.channel?.send(payload);

            channel.setLastMessageID(message.getID());
            DataHandler.setConfig(interaction.channelId, channel);
        }

        if(messages.length === 0) {
            interaction.reply({
                content:"No new messages",
                ephemeral:true
            })
        }
        else {
            interaction.reply({
                content:"Success",
                ephemeral:true
            })
            interaction.deleteReply();
        }
    }

    private async config(interaction:ChatInputCommandInteraction) {
        const channel = await this.getChannel(interaction);
        if(!channel) return;

        const sucess = await DataHandler.addConfig(interaction.channelId, channel);

        if(sucess) {
            interaction.reply({
                content:`Configured to channel ${channel.getName()}`,
                ephemeral:true
            });
        }
        else {
            interaction.reply({
                content:"This Discord channel already has another GroupMe channel assigned",
                ephemeral:true
            })
        }
    }

    private async setConfig(interaction:ChatInputCommandInteraction) {
        const channel = await this.getChannel(interaction);
        if(!channel) return;
        const sucess = await DataHandler.setConfig(interaction.channelId, channel);

        if(sucess) {
            interaction.reply({
                content:`Configured to channel ${channel.getName()}`,
                ephemeral:true
            });
        }
        else {
            interaction.reply({
                content:"No config found for this Discord Channel",
                ephemeral:true
            })
        }
    }

    private async getConfig(interaction:ChatInputCommandInteraction) {
        const channel = await DataHandler.getConfig(interaction.channelId);

        if(channel) {
            interaction.reply({
                content:`Current configuration: \n${JSON.stringify(channel)}`,
                ephemeral:true,
            })
        }
        else {
            interaction.reply({
                content: "This channel is not yet configured.",
                ephemeral:true
            })
        }
    }

    private async getChannel(interaction:ChatInputCommandInteraction) {
        const channelName = interaction.options.getString("channel", true);
        const response = await this.gmController.getChannelByName(channelName);

        if(response.length === 0) {
            interaction.reply({
                content:`No channel found by the name ${channelName}`,
                ephemeral:true
            });
            return false;
        }
        else if(response.length > 1) {
            interaction.reply({
                content:"Multiple channels were found. Please select one.",
                ephemeral:true
            })
            return false;
        }

        return response[0];
    }
}