import * as DiscordJs from "discord.js";
import * as Errors from "~/errors.js";
import * as Commands from "../commands.js";
import { Env } from "~/utility.js";
import { ERR, INFO } from "~/utility/LogMessage.js";

let client: DiscordJs.Client | undefined;
let isInit: true | undefined;

export async function init() {
  if (isInit) return;
  isInit = true;

  Env.init();

  client = createClient();
  client.once(DiscordJs.Events.ClientReady, onLoginSuccess);
  client.once(DiscordJs.Events.InteractionCreate, onInteraction);

  await login();
}

export function assertInit() {
  if (!isInit)
    throw new Errors.basic.Fatal(
      "Attempted to use the Discord client before initialization.",
    );
}

export function get(): DiscordJs.Client<true> {
  assertInit();

  return client as DiscordJs.Client<true>;
}

export async function registerCommands() {
  assertInit();

  await get().application.commands.set(Commands.build());
}

function createClient(): DiscordJs.Client<false> {
  return new DiscordJs.Client({
    intents: [
      DiscordJs.IntentsBitField.Flags.Guilds,
      DiscordJs.IntentsBitField.Flags.GuildMembers,
      DiscordJs.IntentsBitField.Flags.GuildMessages,
      DiscordJs.IntentsBitField.Flags.MessageContent,
    ],
  });
}

async function login() {
  INFO("Setting login");
  const token = Env.getRequired(Env.REQUIRED.DISCORD_TOKEN);
  await get().login(token);
}

function onLoginSuccess(client: DiscordJs.Client<true>) {
  (async () => {
    INFO(`Logged in as ${client.user.tag}`);

    await registerCommands();

    INFO("DiscordMe Online");
  })().catch(handleEventError);
}

function onInteraction(interaction: DiscordJs.Interaction) {
  (async () => {
    if (!interaction.isChatInputCommand()) return;

    const execution = Commands.ExecMapping[interaction.commandName];
    if (!execution) {
      ERR(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await execution(interaction);
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
  })().catch(handleEventError);
}

function handleEventError(err: unknown) {
  if (err instanceof Error) {
    ERR(`${err.stack}`);
    throw err;
  } else {
    ERR(err);
    throw new Errors.basic.Uncaught("Uncaught error. Please check logs.");
  }
}
