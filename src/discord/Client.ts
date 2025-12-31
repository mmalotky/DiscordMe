import * as DiscordJs from "discord.js";

let client: DiscordJs.Client | null;

export function get(): DiscordJs.Client {
  return client
    ? client
    : (client = new DiscordJs.Client({
        intents: [
          DiscordJs.IntentsBitField.Flags.Guilds,
          DiscordJs.IntentsBitField.Flags.GuildMembers,
          DiscordJs.IntentsBitField.Flags.GuildMessages,
          DiscordJs.IntentsBitField.Flags.MessageContent,
        ],
      }));
}
