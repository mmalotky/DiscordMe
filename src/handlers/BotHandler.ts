import * as CommandsHandler from "./CommandsHandler.js";
import * as Discord from "~/discord.js";
import * as DiscordJs from "discord.js";
import * as GroupMeController from "./GroupMeController.js";
import { ERR, INFO } from "~/utility/LogMessage.js";
import { ConfigurationError } from "~/errors.js";

function syncHandleCommands() {
  Discord.Client.get().on(DiscordJs.Events.InteractionCreate, (interaction) => {
    handleCommands(interaction).catch((e) => {
      throw e;
    });
  });
}

/**
 * Listen for Discord commands. Look up registered command, then execute the
 * command according to the interaction parameters, sends an error message to
 * Discord if the operation fails.
 */
async function handleCommands(
  interaction: DiscordJs.Interaction<DiscordJs.CacheType>,
) {
  if (!interaction.isChatInputCommand()) return;
  const command = CommandsHandler.get().filter(
    (c: Discord.Commands.ICommand) =>
      c.getData().name === interaction.commandName,
  )[0];

  if (!command) {
    ERR(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }

    throw err;
  }
}

/**
 * Start up scripts. Acquire Tokens for GroupMe and Discord,
 * register new commands, and begin listening for Discord Commands
 * */
export async function run() {
  const groupMeToken = process.env.GROUPME_TOKEN;
  if (!groupMeToken) throw new ConfigurationError("GROUPME_TOKEN not found");
  const discordToken = process.env.DISCORD_TOKEN;
  if (!discordToken) throw new ConfigurationError("DISCORD_TOKEN not found");

  INFO("Discord Login");
  await Discord.Client.get().login(discordToken);
  INFO("Login Complete");

  INFO("Setting GroupMe Token");
  GroupMeController.setToken(process.env.GROUPME_TOKEN);
  INFO("Token Set");

  Discord.Client.get().once(DiscordJs.Events.ClientReady, () => {
    INFO("DiscordMe Starting");
    CommandsHandler.setToken(process.env.DISCORD_TOKEN);
    CommandsHandler.init();
    CommandsHandler.register().catch((err) => {
      throw new ConfigurationError(`Failed to register commands:\n\n${err}`);
    });
    syncHandleCommands();
    INFO("DiscordMe Online");
  });

  if (process.env.CI) await new Discord.Commands.GM().updateNow();
}
