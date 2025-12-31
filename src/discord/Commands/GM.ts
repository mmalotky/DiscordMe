import * as Discord from "~/discord.js";
import * as DiscordJs from "discord.js";
import type { ICommand } from "./ICommand.js";
import * as GroupMeController from "~/handlers/GroupMeController.js";
import * as DataHandler from "~/handlers/DataHandler.js";
import {
  fillInlineAttachments,
  parseDiscordMessage,
} from "~/utility/MessageParser.js";
import GroupMeMessage from "~/models/GroupMeMessage.js";
import * as WebHooksHandler from "~/handlers/WebhooksHandler.js";
import GroupMeChannel from "~/models/GroupMeChannel.js";
import { ConfigurationError, GroupMeMessageParseError } from "~/errors.js";
import { ERR, INFO } from "~/utility/LogMessage.js";
import { getFile } from "~/handlers/GroupMeFileController.js";
import { Env } from "~/utility.js";

export class GM implements ICommand {
  /**
   * GM Command class. Allows bot configuration within discord servers
   * and pulling GroupMe chat history into the configured Channel.
   */

  constructor() {}

  /**
   * Metadata for the Discord Command
   * Builds the discord slash command and any subcommands
   * */
  private data = new DiscordJs.SlashCommandBuilder()
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
  async execute(interaction: DiscordJs.ChatInputCommandInteraction) {
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

  async updateNow() {
    Env.init();

    INFO("Updating messages");

    const groupMeGroupId = Env.getRequired(Env.OPTIONAL.TEST_GROUPME_GROUP_ID);
    const groupMeGroup = new GroupMeChannel(groupMeGroupId, "TEST");

    const discordChannelId = Env.getRequired(
      Env.OPTIONAL.TEST_DISCORD_CHANNEL_ID,
    );
    const discordChannel = (await Discord.Client.get().channels.fetch(
      discordChannelId,
    )) as DiscordJs.TextChannel | undefined;
    if (!discordChannel)
      throw new ConfigurationError("Failed to get discord channel from id");

    await this.sendMessages(groupMeGroup, discordChannel);
  }

  /**
   * Update subcommand.
   * Pulls data from GroupMe and adds sends any new messages to the discord client.
   * Updates the latest message ID for each message sent.
   * Creates Webhooks to emulate different GroupMe Users
   * @param interaction -
   * */
  async update(interaction: DiscordJs.ChatInputCommandInteraction) {
    const groupMeChannel = DataHandler.getConfig(interaction.channelId);
    const discordChannel = interaction.channel;
    if (!groupMeChannel || !discordChannel) return;
    await this.sendMessages(groupMeChannel, discordChannel, interaction);
  }

  private async sendMessages(
    groupMeChannel: GroupMeChannel,
    discordChannel: DiscordJs.TextBasedChannel,
    interaction?: DiscordJs.ChatInputCommandInteraction,
  ) {
    const messages = await GroupMeController.getMessages(groupMeChannel);

    if (interaction) {
      if (messages.length === 0) {
        await interaction.reply({
          content: "No new messages",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "Loading up messages",
          ephemeral: true,
        });
        await interaction.deleteReply();
      }
    }

    for (const message of messages) {
      fillInlineAttachments(message);

      const messageList = this.splitMessage(message.getText()).map(
        (m) =>
          new GroupMeMessage(
            message.getID(),
            message.getMember(),
            message.getGroupID(),
            message.getCreatedOn(),
            m,
            [],
            message.getIsSystem(),
          ),
      );

      if (messageList.length === 0) {
        await this.sendGroupMeMessageToDiscordChannel(message, discordChannel);
      } else {
        messageList[messageList.length - 1].setAttachments(
          message.getAttachments(),
        );
        for (const m of messageList)
          await this.sendGroupMeMessageToDiscordChannel(m, discordChannel);
      }

      groupMeChannel.setLastMessageID(message.getID());
      if (interaction)
        DataHandler.setConfig(interaction.channelId, groupMeChannel);
    }
  }

  private splitMessage(message: string) {
    const messageList: string[] = [];
    if (message.length <= 1500) {
      messageList.push(message);
      return messageList;
    }

    let i = 0;
    do {
      /*
        Check for appropriate breaking points such as whitespace and characters outside of
        codes delimited with colons.
        */
      const areaCheck = message.substring(i, i + 1500);
      if (areaCheck.length === 0) {
        i += 1;
        continue;
      }

      const re = /(\s+[^:\s]*$)|\s*(:[^:\s]+:[^:\s]*$)|\s*:[^\s:]*$/;
      const substring = areaCheck.replace(re, "");

      if (substring.length === 0) {
        messageList.push(areaCheck);
        i += areaCheck.length;
      } else {
        messageList.push(substring);
        i += substring.length;
      }
    } while (i < message.length);

    return messageList;
  }

  private async sendGroupMeMessageToDiscordChannel(
    message: GroupMeMessage,
    discordChannel: DiscordJs.TextBasedChannel,
  ) {
    const webHook = await this.getWebHook(discordChannel, message);
    const webHookClient = new DiscordJs.WebhookClient({ url: webHook.url });
    const payload = parseDiscordMessage(message);
    await webHookClient.send(payload);
  }

  /**
   * Find or create a webhook for a GroupMe message
   * @param discordChannel - discord channel for the webhook
   * @param message - GroupMeMessage using the Webhook
   * @returns Promise<Webhook>
   */
  private async getWebHook(
    discordChannel: DiscordJs.TextBasedChannel,
    message: GroupMeMessage,
  ): Promise<DiscordJs.Webhook> {
    const webHook = await WebHooksHandler.getWebhookByChannel(discordChannel);

    try {
      const avatar = message.getMember().getAvatarURL()
        ? await getFile(message.getMember().getAvatarURL() + ".avatar")
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
      if (!(err instanceof GroupMeMessageParseError)) ERR(err);

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
  private async config(interaction: DiscordJs.ChatInputCommandInteraction) {
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
  private async setConfig(interaction: DiscordJs.ChatInputCommandInteraction) {
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
  private async getConfig(interaction: DiscordJs.ChatInputCommandInteraction) {
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
  private async getChannel(interaction: DiscordJs.ChatInputCommandInteraction) {
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
