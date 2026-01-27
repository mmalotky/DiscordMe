import * as DiscordJs from "discord.js";
import * as GroupMe from "~/groupMe.js";
import * as Errors from "~/errors.js";

/** Convert GroupMeMessage Model into a Discord Message */
export function parseDiscordMessage(
  gmMessage: GroupMe.Message,
): DiscordJs.MessageCreateOptions {
  const content = gmMessage.getText();
  const embeds = getEmbeds(gmMessage);
  const files = getFiles(gmMessage);

  const message: DiscordJs.MessageCreateOptions = {
    content: content,
    embeds: embeds,
    files: files,
  };

  return message;
}

/** Format GroupMe Message attachments as embeds in a Discord message */
function getEmbeds(gmMessage: GroupMe.Message) {
  const attachments: GroupMe.attachments.Attachment[] =
    gmMessage.getAttachments();
  const embeds: DiscordJs.APIEmbed[] = [];

  const videos: DiscordJs.APIEmbed[] = attachments
    .filter((a) => a.type === GroupMe.attachments.Types.Video)
    .map((a): DiscordJs.APIEmbed => {
      return {
        video: {
          url: a.content,
        },
      };
    });

  embeds.push(...videos);

  return embeds;
}

function getFiles(gmMessage: GroupMe.Message): DiscordJs.AttachmentBuilder[] {
  const attachments: GroupMe.attachments.Attachment[] =
    gmMessage.getAttachments();
  const files: DiscordJs.AttachmentBuilder[] = [];

  const embeds = attachments
    .filter(
      (a) =>
        a.type === GroupMe.attachments.Types.Image ||
        a.type === GroupMe.attachments.Types.File,
    )
    .map((embed) => {
      assertNotMissing("data", embed.data);
      assertNotMissing("name", embed.name);
      return new DiscordJs.AttachmentBuilder(embed.data).setName(embed.name);
    });

  files.push(...embeds);
  return files;
}

function assertNotMissing<R>(
  symbol: string,
  value: R | undefined,
): asserts value is R {
  if (value === undefined) throw new Errors.net.Parse(`missing ${symbol}`);
}
