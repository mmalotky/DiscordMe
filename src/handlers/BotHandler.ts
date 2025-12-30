import * as dotenv from "dotenv";
import { Client, IntentsBitField, Events } from "discord.js";
import * as CommandsHandler from "./CommandsHandler.js";
import * as GroupMeController from "./GroupMeController.js";
import Command from "~/commands/Command.js";
import GMCommand from "~/commands/GM.js";
import { ERR, INFO } from "~/utility/LogMessage.js";
import { ConfigurationError } from "~/errors.js";

let _client: Client | null;

export function getClient(): Client {
  return _client
    ? _client
    : (_client = new Client({
        intents: [
          IntentsBitField.Flags.Guilds,
          IntentsBitField.Flags.GuildMembers,
          IntentsBitField.Flags.GuildMessages,
          IntentsBitField.Flags.MessageContent,
        ],
      }));
}

/**
 * Listen for Discord commands. Look up registered command, then execute the
 * command according to the interaction parameters, sends an error message to
 * Discord if the operation fails.
 */
function handleCommands() {
  getClient().on(Events.InteractionCreate, (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = CommandsHandler.get().filter(
      (c: Command) => c.getData().name === interaction.commandName,
    )[0];

    if (!command) {
      ERR(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    command
      .execute(interaction)
      .then(() => {})
      .catch((error) => {
        ERR(error);
        if (interaction.replied || interaction.deferred) {
          interaction
            .followUp({
              content: "There was an error while executing this command!",
              ephemeral: true,
            })
            .then(() => {})
            .catch(() => {});
        } else {
          interaction
            .reply({
              content: "There was an error while executing this command!",
              ephemeral: true,
            })
            .then(() => {})
            .catch(() => {});
        }
      });
  });
}
/**
 * Start up scripts. Acquire Tokens for GroupMe and Discord,
 * register new commands, and begin listening for Discord Commands
 * */
export function run() {
  dotenv.config();
  INFO("Discord Login");
  getClient()
    .login(process.env.DISCORD_TOKEN)
    .then(() => {
      INFO("Setting GroupMe Token");
      GroupMeController.setToken(process.env.GROUPME_TOKEN);

      getClient().once(Events.ClientReady, () => {
        INFO("DiscordMe Starting");
        CommandsHandler.setToken(process.env.DISCORD_TOKEN);
        CommandsHandler.init();
        CommandsHandler.register();
        handleCommands();
        INFO("DiscordMe Online");
      });
    })
    .then()
    .catch(() => {})
    .finally(() => process.exit());
}

/**
 * Start up scripts. Acquire Tokens for GroupMe and Discord,
 * register new commands, and begin listening for Discord Commands
 * */
export async function runAndExit() {
  console.log("ergthyju");
  console.log(`TESTING: ${process.env.TEST_GROUPME_GROUP_NAME}`);
  const groupMeToken = process.env.GROUPME_TOKEN;
  if (!groupMeToken) throw new ConfigurationError("GROUPME_TOKEN not found");
  const discordToken = process.env.DISCORD_TOKEN;
  if (!discordToken) throw new ConfigurationError("DISCORD_TOKEN not found");

  console.log("2e3r4t5yu67kjhgrfe");

  INFO("Discord Login");
  await getClient().login(discordToken);
  INFO("Setting GroupMe Token");
  GroupMeController.setToken(groupMeToken);
  getClient().once(Events.ClientReady, () => {
    INFO("DiscordMe Starting");
    CommandsHandler.setToken(discordToken);
    CommandsHandler.init();
    CommandsHandler.register();
    handleCommands();
    INFO("DiscordMe Online");
  });

  await new GMCommand().updateNow();
}
