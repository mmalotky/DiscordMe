import { APIEmbed, AttachmentBuilder, MessageCreateOptions } from "discord.js";
import {
  GroupMeAttachment,
  GroupMeEmojiAttachment,
  GroupMeEventAttachment,
  GroupMeFileAttachment,
  GroupMeImageAttachment,
  GroupMeLocationAttachment,
  GroupMeMentionsAttachment,
  GroupMePollAttachment,
  GroupMeReplyAttachment,
  GroupMeSplitAttachment,
  GroupMeVideoAttachment,
} from "../models/GroupMeAttachment";
import GroupMeMember from "../models/GroupMeMember";
import GroupMeMessage from "../models/GroupMeMessage";
import { WARN } from "./LogMessage";
import { emojiMap } from "./GroupMeEmojiMap";
import { GroupMeMessageParseError } from "../errors";
import GroupMeFileController from "../handlers/GroupMeFileController";

/**
 * JSON message data received from GroupMe API
 */
export type GroupMeAPIMessage = {
  id: string;
  user_id: string;
  name: string;
  avatar_url: string;
  group_id: string;
  created_at: number;
  text: string;
  system: boolean;
  attachments: GroupMeAPIAttachment[];
};

/** JSON attachment data received from GroupMe API */
type GroupMeAPIAttachment = {
  type: string;
  url: string;
  placeholder: string;
  charmap: number[][];
  name: string;
  lng: string;
  lat: string;
  token: string;
  id: string;
  file_id: string;
  reply_id: string;
  user_ids: string[];
  loci: number[][];
};

/** Convert GroupMe API message data to GroupMeMessage Model
 * @throws GroupMeMessageParseError
 */
export async function parseGroupMeMessage(
  json: GroupMeAPIMessage,
  fileController: GroupMeFileController,
  GROUPME_TOKEN: string
): Promise<GroupMeMessage> {

  return new GroupMeMessage(
    json.id,
    new GroupMeMember(json.user_id, json.name, json.avatar_url),
    json.group_id,
    new Date(json.created_at * 1000),
    json.text,
    await parseAttachments(json.attachments, fileController),
    json.system
  );
}

async function parseAttachments(rawAttachments: GroupMeAPIAttachment[], fileC: GroupMeFileController): Promise<GroupMeAttachment[]> {

  const attachments: GroupMeAttachment[] = [];


  for (const raw of rawAttachments) {
    switch (raw.type) {
      case "image": {
        attachments.push(await parseImageAttachment(raw, fileC));
        break;
      }
      case "emoji": {
        attachments.push(parseEmojiAttachment(raw));
        break;
      }
      case "location": {
        attachments.push(parseLocationAttachment(raw));
        break;
      }
      case "split": {
        attachments.push(parseSplitAttachment(raw));
        break;
      }
      case "video": {
        attachments.push(parseVideoAttachment(raw));
        break;
      }
      case "file": {
        attachments.push(await parseFileAttachment(raw, fileC));
        break;
      }
      case "reply": {
        attachments.push(parseReplyAttachment(raw));
        break;
      }
      case "mentions": {
        attachments.push(parseMentionsAttachment(raw));
        break;
      }
      case "poll": {
        attachments.push(parsePollAttachment(raw));
        break;
      }
      case "event": {
        attachments.push(parseEventAttachment(raw));
        break;
      }
      default: {
        WARN(`Attachment type ${raw.type} not recognized.`);
      }
    }
  }

  return attachments;
}

/**
 *
 * @param raw -
 *
 * @Throws GroupMeMessageParseError
 */
async function parseImageAttachment(raw: GroupMeAPIAttachment, fileC: GroupMeFileController): Promise<GroupMeAttachment> {
  const imgUrl = raw.url;
  const re: RegExp = /\w+(?=\.\w{32}$)/;

  const extensionSearch = re.exec(imgUrl);
  if (!extensionSearch) {
    throw new GroupMeMessageParseError(
      `Failed to parse image type from ${imgUrl}`
    );
  }
  const extension = extensionSearch[0];

  const imgName = "GroupMeImage." + extension;
  const image = await fileC.getFile(imgUrl);

  return new GroupMeImageAttachment(imgName, image);
}

/**
 *
 * @param raw -
 *
 * @throws GroupMeMessageParseError
 */
function parseEmojiAttachment(raw: GroupMeAPIAttachment): GroupMeAttachment {
  const placeholder = raw.placeholder;
  const charmap = raw.charmap;
  return new GroupMeEmojiAttachment(placeholder, charmap);
}

/**
 *
 * @param raw -
 *
 * @throws GroupMeMessageParseError
 */
function parseLocationAttachment(raw: GroupMeAPIAttachment): GroupMeAttachment {
  const name = raw.name;
  const lat = raw.lat;
  const lng = raw.lng;
  return new GroupMeLocationAttachment(name, lat, lng);
}

/**
 *
 * @param raw -
 *
 * @throws GroupMeMessageParseError
 */
function parseSplitAttachment(raw: GroupMeAPIAttachment): GroupMeAttachment {
  const token = raw.token;
  return new GroupMeSplitAttachment(token);
}

/**
 *
 * @param raw -
 *
 * @throws GroupMeMessageParseError
 */
function parseVideoAttachment(raw: GroupMeAPIAttachment): GroupMeAttachment {
  const vidUrl = raw.url;
  return new GroupMeVideoAttachment(vidUrl);
}

/**
 *
 * @param raw -
 *
 * @throws GroupMeMessageParseError
 */
async function parseFileAttachment(raw: GroupMeAPIAttachment, fileC: GroupMeFileController): Promise<GroupMeAttachment> {
  const fileId = raw.file_id;
  const fileURL = `https://file.groupme.com/v1/${groupID}/files/${fileId}?token=${GROUPME_TOKEN}`;
  const fileData = await fileC.getFile(fileURL);
  const fileName = await fileC.getFileName(fileURL);

  return new GroupMeFileAttachment(fileURL, fileName, fileData);
}

/**
 *
 * @param raw -
 *
 * @throws GroupMeMessageParseError
 */
function parseReplyAttachment(raw: GroupMeAPIAttachment): GroupMeAttachment {
  const replyID = raw.reply_id;
  return new GroupMeReplyAttachment(replyID);
}

/**
 *
 * @param raw -
 *
 * @throws GroupMeMessageParseError
 */
function parseMentionsAttachment(raw: GroupMeAPIAttachment): GroupMeAttachment {
  const userIDs = raw.user_ids;
  const loci = raw.loci;
  return new GroupMeMentionsAttachment(userIDs, loci);
}

/**
 *
 * @param raw -
 *
 * @throws GroupMeMessageParseError
 */
function parsePollAttachment(raw: GroupMeAPIAttachment): GroupMeAttachment {
  const pollID = raw.id;
  return new GroupMePollAttachment(pollID);
}

/**
 *
 * @param raw -
 *
 * @throws GroupMeMessageParseError
 */
function parseEventAttachment(raw: GroupMeAPIAttachment): GroupMeAttachment {
  const eventID = raw.id;
  return new GroupMeEventAttachment(eventID);
}

/** Convert GroupMeMessage Model into a Discord Message */
export function parseDiscordMessage(
  gmMessage: GroupMeMessage
): MessageCreateOptions {
  const tag = getTag(gmMessage);
  const content = getContent(gmMessage);
  const embeds = getEmbeds(gmMessage);
  const files = getFiles(gmMessage);

  const message: MessageCreateOptions = {
    content: tag + content,
    embeds: embeds,
    files: files,
  };

  return message;
}

/** Utility Function to get the GroupMe Message's sending date and return it as a formatted string */
function getTag(gmMessage: GroupMeMessage) {
  const time = `<t:${Math.floor(gmMessage.getCreatedOn().getTime() / 1000)}>`;
  return `[${time}]   `;
}

/** Utility function to add inline attachments to the GroupMe Message content body */
function getContent(gmMessage: GroupMeMessage) {
  const attachments = gmMessage.getAttachments();
  const emojis = attachments.filter((a) => a instanceof GroupMeEmojiAttachment);
  let text = gmMessage.getText() ? gmMessage.getText() : "";

  for (const emoji of emojis) {
    const placeholder = emoji.content;

    for (let i = 0; i < emoji.map.length; i++) {
      const index = emoji.map[i][0];
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
  return text;
}

/** Format GroupMe Message attachments as embeds in a Discord message */
function getEmbeds(gmMessage: GroupMeMessage) {
  const attachments: GroupMeAttachment[] = gmMessage.getAttachments();
  const embeds: APIEmbed[] = [];

  const videos: APIEmbed[] = attachments
    .filter((a) => a instanceof GroupMeVideoAttachment)
    .map((a): APIEmbed => {
      return {
        video: {
          url: a.content,
        },
      };
    });

  embeds.push(...videos);

  return embeds;
}

function getFiles(gmMessage: GroupMeMessage): AttachmentBuilder[] {
  const attachments: GroupMeAttachment[] = gmMessage.getAttachments();
  const files: AttachmentBuilder[] = [];

  const images = attachments
    .filter((a) => a instanceof GroupMeImageAttachment)
    .map((img) => {
      return new AttachmentBuilder(img.data).setName(img.name);
    });

    const fileAttachments = attachments
    .filter((a) => a instanceof GroupMeFileAttachment)
    .map((file) => {
      return new AttachmentBuilder(file.data).setName(file.name);
    });

  files.push(...images, ...fileAttachments);
  return files;
}
