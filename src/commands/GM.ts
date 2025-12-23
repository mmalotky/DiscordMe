import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  TextBasedChannel,
  Webhook,
  WebhookClient,
} from "discord.js";
import Command from "./Command.js";
import * as GroupMeController from "~/handlers/GroupMeController.js";
import * as DataHandler from "~/handlers/DataHandler.js";
import { parseDiscordMessage } from "~/utility/MessageParser.js";
import GroupMeMessage from "~/models/GroupMeMessage.js";
import * as WebHooksHandler from "~/handlers/WebhooksHandler.js";

export default class GM implements Command {
  /**
   * GM Command class. Allows bot configuration within discord servers
   * and pulling GroupMe chat history into the configured Channel.
   */

  constructor() {}

  /**
   * Metadata for the Discord Command
   * Builds the discord slash command and any subcommands
   * */
  private data = new SlashCommandBuilder()
    .setName("gm")
    .setDescription("GroupMe Bot controller")
    .addSubcommand((sub) => {
      return sub
        .setName("config")
        .setDescription("Configure a discord text channel")
        .addStringOption((option) => {
          return option
            .setName("channel")
            .setRequired(true)
            .setDescription("Name of GroupMe Channel");
        });
    })
    .addSubcommand((sub) => {
      return sub
        .setName("setconfig")
        .setDescription("Change configuration")
        .addStringOption((option) => {
          return option
            .setName("channel")
            .setRequired(true)
            .setDescription("Name of GroupMe Channel");
        });
    })
    .addSubcommand((sub) => {
      return sub
        .setName("getconfig")
        .setDescription("Get the current configuration");
    })
    .addSubcommand((sub) => {
      return sub
        .setName("update")
        .setDescription("Get messages since last update");
    });

  /** Interface implementation for returning metadata */
  getData() {
    return this.data;
  }

  /**
   * Interface implementation of executing the slash command.
   * Selects from the list of subcommands.
   */
  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();
    switch (subcommand) {
      case "config":
        await this.config(interaction);
        break;

      case "setconfig":
        await this.setConfig(interaction);
        break;

      case "getconfig":
        await this.getConfig(interaction);
        break;

      case "update":
        await this.update(interaction);
        break;

      default:
        await interaction.reply({
          content: `Subcommand "${subcommand}" not recognized.`,
          ephemeral: true,
        });
    }
  }

  /**
   * Update subcommand.
   * Pulls data from GroupMe and adds sends any new messages to the discord client.
   * Updates the latest message ID for each message sent.
   * Creates Webhooks to emulate different GroupMe Users
   * @param interaction -
   * */
  private async update(interaction: ChatInputCommandInteraction) {
    const groupMeChannel = DataHandler.getConfig(interaction.channelId);
    const discordChannel = interaction.channel;
    if (!groupMeChannel || !discordChannel) return;
    const messages = await GroupMeController.getMessages(groupMeChannel);

    if (messages.length === 0) {
      await interaction.reply({
        content: "No new messages",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "Success",
        ephemeral: true,
      });
      await interaction.deleteReply();
    }

    for (const message of messages) {
      const webHook = await this.getWebHook(discordChannel, message);
      const webHookClient = new WebhookClient({ url: webHook.url });

      const payload = parseDiscordMessage(message);
      payload.content = payload.content ? payload.content : "";
      const contentLength = payload.content.length;

      let i = 0;
      for (let j = 1500; j < contentLength; i = j, j += 1500) {
        /*
                Check for appropriate breaking points such as whitespace and characters outside of
                codes delimited with colons. Exclude the opening tag.
                */
        const areaCheck = payload.content.substring(i, j);
        const re = /(?<!^\[<t:.+>\] +)(?<!^\[<t)[:\s][^:\s]+[:\s]*$/;
        const substring = areaCheck.replace(re, "");
        j += substring.length - areaCheck.length;

        const tag = /^\[<t:.+>\]\s{3}/;
        const text = substring.replace(tag, "");

        const subMessage = new GroupMeMessage(
          message.getID(),
          message.getMember(),
          message.getGroupID(),
          message.getCreatedOn(),
          text,
          [],
          message.getIsSystem(),
        );
        const subPayload = parseDiscordMessage(subMessage);
        await webHookClient.send(subPayload);
      }
      const finalMessage = payload.content.substring(i);
      payload.content = finalMessage;
      await webHookClient.send(payload);

      groupMeChannel.setLastMessageID(message.getID());
      DataHandler.setConfig(interaction.channelId, groupMeChannel);
    }
  }

  /**
   * Find or create a webhook for a GroupMe message
   * @param discordChannel - discord channel for the webhook
   * @param message - GroupMeMessage using the Webhook
   * @returns Promise<Webhook>
   */
  private async getWebHook(
    discordChannel: TextBasedChannel,
    message: GroupMeMessage,
  ): Promise<Webhook> {
    const webHook = await WebHooksHandler.getWebhookByChannel(discordChannel);

    try {
      const avatar = message.getMember().getAvatarURL()
        ? await GroupMeController.getImage(
            message.getMember().getAvatarURL() + ".avatar",
          )
        : null;

      if (!webHook)
        return await WebHooksHandler.createWebHook(
          discordChannel,
          message,
          avatar,
        );
      else if (webHook.name === message.getMember().getName()) return webHook;
      else return await WebHooksHandler.editWebhook(webHook, message, avatar);
    } catch (err) {
      console.error(err);

      if (!webHook)
        return await WebHooksHandler.createWebHook(
          discordChannel,
          message,
          null,
        );
      else if (webHook.name === message.getMember().getName()) return webHook;
      else return await WebHooksHandler.editWebhook(webHook, message, null);
    }
  }

  /**
   * Config subcommand.
   * Configures a Discord channel to receive messages from a GroupMe
   * channel when the update command is run. Stores the preferences
   * permanent data. Does not update a Discord Channel with an existing
   * configuration (see setConfig).
   * @param interaction -
   * */
  private async config(interaction: ChatInputCommandInteraction) {
    const channel = await this.getChannel(interaction);
    if (!channel) return;

    const success = DataHandler.addConfig(interaction.channelId, channel);

    if (success) {
      await interaction.reply({
        content: `Configured to channel ${channel.getName()}`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content:
          "This Discord channel already has another GroupMe channel assigned",
        ephemeral: true,
      });
    }
  }

  /**
   * SetConfig Subcommand.
   * Updates an existing configuration for a discord channel.
   * @param interaction -
   */
  private async setConfig(interaction: ChatInputCommandInteraction) {
    const channel = await this.getChannel(interaction);
    if (!channel) return;

    const rm = DataHandler.rmConfig(interaction.channelId);
    const add = DataHandler.addConfig(interaction.channelId, channel);

    if (rm && add) {
      await interaction.reply({
        content: `Configured to channel ${channel.getName()}`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "No config found for this Discord Channel",
        ephemeral: true,
      });
    }
  }

  /**
   * GetConfig Subcommand
   * Sends the current GroupMe Channel configured to a Discord Channel
   * @param interaction -
   */
  private async getConfig(interaction: ChatInputCommandInteraction) {
    const channel = DataHandler.getConfig(interaction.channelId);

    if (channel) {
      await interaction.reply({
        content: `Current configuration: \n${JSON.stringify(channel)}`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "This channel is not yet configured.",
        ephemeral: true,
      });
    }
  }

  /**
   * A utility function for pulling GroupMe Channels available for configuration
   * and comparing to a string parameter in the Discord interaction.
   *
   * @remarks - TODO: Discuss Security and Privacy Implications!
   *
   * @param interaction -
   * @returns List of available channel names
   */
  private async getChannel(interaction: ChatInputCommandInteraction) {
    const channelName = interaction.options.getString("channel", true);
    const response = await GroupMeController.getChannelByName(channelName);

    if (response.length === 0) {
      await interaction.reply({
        content: `No channel found by the name ${channelName}`,
        ephemeral: true,
      });
      return false;
    } else if (response.length > 1) {
      await interaction.reply({
        content: "Multiple channels were found. Please select one.",
        ephemeral: true,
      });
      return false;
    }

    return response[0];
  }
}
