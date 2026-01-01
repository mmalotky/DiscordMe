import * as DiscordJs from "discord.js";
import { WARN } from "./LogMessage.js";
import { emojiMap } from "./GroupMeEmojiMap.js";
import * as Discord from "~/discord.js";
import * as GroupMe from "~/groupMe.js";

/** Convert GroupMeMessage Model into a Discord Message */
export function parseDiscordMessage(
  gmMessage: GroupMe.Message,
): DiscordJs.MessageCreateOptions {
  const tag = getTag(gmMessage);
  const content = gmMessage.getText();
  const embeds = getEmbeds(gmMessage);
  const files = getFiles(gmMessage);

  const message: DiscordJs.MessageCreateOptions = {
    content: tag + content,
    embeds: embeds,
    files: files,
  };

  return message;
}

/** Utility Function to get the GroupMe Message's sending date and return it as a formatted string */
function getTag(gmMessage: GroupMe.Message) {
  const time = `<t:${Math.floor(gmMessage.getCreatedOn().getTime() / 1000)}>`;
  return `[${time}]   `;
}

/** Utility function to add inline attachments to the GroupMe Message content body */
export function fillInlineAttachments(gmMessage: GroupMe.Message) {
  const attachments = gmMessage.getAttachments();
  const emojis = attachments.filter(
    (a) => a instanceof GroupMe.EmojiAttachment,
  );
  let text = gmMessage.getText();

  for (const emoji of emojis) {
    const placeholder = emoji.content;

    for (let i = 0; i < emoji.map.length; i++) {
      const index = emoji.map[i][0] - 1;
      if (emojiMap.length < index + 1) {
        WARN(`Emoji not yet implemented. Index: [${index}]`);
        continue;
      }
      const pick = emoji.map[i][1];
      if (emojiMap[index].length < pick + 1) {
        WARN(`Emoji not yet implemented. Index: [${index}, ${pick}]`);
        continue;
      }
      const emojiID = emojiMap[index][pick];
      text = text.replace(placeholder, emojiID);
    }
  }
  text = Discord.EmojiMap.parse(text);

  gmMessage.setAttachments(
    gmMessage
      .getAttachments()
      .filter((a) => !(a instanceof GroupMe.EmojiAttachment)),
  );
  gmMessage.setText(text);
}

/** Format GroupMe Message attachments as embeds in a Discord message */
function getEmbeds(gmMessage: GroupMe.Message) {
  const attachments: GroupMe.Attachment[] = gmMessage.getAttachments();
  const embeds: DiscordJs.APIEmbed[] = [];

  const videos: DiscordJs.APIEmbed[] = attachments
    .filter((a) => a instanceof GroupMe.VideoAttachment)
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
  const attachments: GroupMe.Attachment[] = gmMessage.getAttachments();
  const files: DiscordJs.AttachmentBuilder[] = [];

  const images = attachments
    .filter((a) => a instanceof GroupMe.ImageAttachment)
    .map((img) => {
      return new DiscordJs.AttachmentBuilder(img.data).setName(img.name);
    });

  const fileAttachments = attachments
    .filter((a) => a instanceof GroupMe.FileAttachment)
    .map((file) => {
      return new DiscordJs.AttachmentBuilder(file.data).setName(file.name);
    });

  files.push(...images, ...fileAttachments);
  return files;
}
