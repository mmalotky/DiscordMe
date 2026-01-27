import * as DiscordJs from "discord.js";
import * as ClientHandler from "../handlers/ClientHandler.js";
import * as DataHandler from "~/handlers/DataHandler.js";
import { parseDiscordMessage } from "~/utility/MessageParser.js";
import * as WebHooksHandler from "~/handlers/WebhooksHandler.js";
import * as GroupMe from "~/groupMe.js";
import { getFile } from "~/handlers/GroupMeFileController.js";
import { Env, Log } from "~/utility.js";
import * as Errors from "~/errors.js";

export const NAME: string = "gm";

export function build(): DiscordJs.SlashCommandSubcommandsOnlyBuilder {
  return new DiscordJs.SlashCommandBuilder()
    .setName(NAME)
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
}

/**
 * Interface implementation of executing the slash command.
 * Selects from the list of subcommands.
 */
export async function execute(
  interaction: DiscordJs.ChatInputCommandInteraction,
) {
  Log.INFO("Executing GM command");
  const subcommand = interaction.options.getSubcommand();
  switch (subcommand) {
    case "config":
      await config(interaction);
      break;

    case "setconfig":
      await setConfig(interaction);
      break;

    case "getconfig":
      await getConfig(interaction);
      break;

    case "update":
      await update(interaction);
      break;

    default:
      await interaction.reply({
        content: `Subcommand "${subcommand}" not recognized.`,
        ephemeral: true,
      });
  }
}

export async function updateNow() {
  ClientHandler.assertInit();

  Log.INFO("Updating messages");

  const groupMeGroupId = Env.getRequired(Env.OPTIONAL.TEST_GROUPME_GROUP_ID);
  GroupMe.init();
  const groupMeGroup = await GroupMe.GroupHandler.fetchById(groupMeGroupId);

  const discordChannelId = Env.getRequired(
    Env.OPTIONAL.TEST_DISCORD_CHANNEL_ID,
  );
  const discordChannel = (await ClientHandler.get().channels.fetch(
    discordChannelId,
  )) as DiscordJs.TextChannel | undefined;
  if (!discordChannel)
    throw new Errors.ConfigurationError(
      "Failed to get discord channel from id",
    );

  await sendMessages(groupMeGroup, discordChannel);
}

/**
 * Update subcommand.
 * Pulls data from GroupMe and adds sends any new messages to the discord client.
 * Updates the latest message ID for each message sent.
 * Creates Webhooks to emulate different GroupMe Users
 * @param interaction -
 * */
async function update(interaction: DiscordJs.ChatInputCommandInteraction) {
  Log.INFO("Running GM update command");
  const groupMeChannel = DataHandler.getConfig(interaction.channelId);
  const discordChannel = interaction.channel;
  if (!groupMeChannel || !discordChannel) return;
  await sendMessages(groupMeChannel, discordChannel, interaction);
}

async function sendMessages(
  groupMeChannel: GroupMe.Group,
  discordChannel: DiscordJs.TextBasedChannel,
  interaction?: DiscordJs.ChatInputCommandInteraction,
) {
  Log.INFO(`Sending messages from GroupMe to Discord`);
  const messages = await GroupMe.MessageHandler.getMessages(groupMeChannel);

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
    await sendGroupMeMessageToDiscordChannel(message, discordChannel);

    groupMeChannel.setLastMessageID(message.getID());
    if (interaction)
      DataHandler.setConfig(interaction.channelId, groupMeChannel);
  }
}

async function sendGroupMeMessageToDiscordChannel(
  message: GroupMe.Message,
  discordChannel: DiscordJs.TextBasedChannel,
) {
  const webHook = await getWebHook(discordChannel, message);
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
async function getWebHook(
  discordChannel: DiscordJs.TextBasedChannel,
  message: GroupMe.Message,
): Promise<DiscordJs.Webhook> {
  Log.INFO(`Fetching a webhook for (gm-user:${message.getMember().getID()})`);
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
    if (!(err instanceof Errors.GroupMeMessageParseError)) Log.ERR(err);

    if (!webHook)
      return await WebHooksHandler.createWebHook(discordChannel, message, null);
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
async function config(interaction: DiscordJs.ChatInputCommandInteraction) {
  Log.INFO("Running GM config command");
  const channel = await getChannel(interaction);

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
async function setConfig(interaction: DiscordJs.ChatInputCommandInteraction) {
  Log.INFO("Running GM setconfig command");
  const channel = await getChannel(interaction);

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
 * Sends the current GroupMe group configured to a Discord Channel
 * @param interaction -
 */
async function getConfig(interaction: DiscordJs.ChatInputCommandInteraction) {
  Log.INFO("Running GM getconfig command");
  const group = DataHandler.getConfig(interaction.channelId);

  if (group) {
    await interaction.reply({
      content: `Current configuration: \n${JSON.stringify(group)}`,
      ephemeral: true,
    });
  } else {
    await interaction.reply({
      content: "This group is not yet configured.",
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
async function getChannel(
  interaction: DiscordJs.ChatInputCommandInteraction,
): Promise<GroupMe.Group> {
  Log.INFO("Fetching channel from interaction");

  const name = interaction.options.getString("channel", true);
  try {
    GroupMe.init();
    return await GroupMe.GroupHandler.fetchByName(name);
  } catch (err) {
    Log.ERR(err);
    Errors.assertValid(err);
    switch (err.constructor) {
      case Errors.basic.TooMany:
        await interaction.reply({
          content: "Multiple channels were found. Please select one.",
          ephemeral: true,
        });
        break;
      case Errors.net.NotFound:
        await interaction.reply({
          content: `No channel found by the name ${name}`,
          ephemeral: true,
        });
        break;
      default:
        break;
    }
    throw err;
  }
}
