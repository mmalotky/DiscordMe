import { GroupMeMessageParseError } from "~/errors.js";
import * as GMAttachments from "../models/Attachments.js";
import { Member } from "../models/Member.js";
import { Message } from "../models/Message.js";
import { IAttachment, IMessage } from "../net/api.js";
import * as GroupMeFileController from "~/handlers/GroupMeFileController.js";
import { WARN } from "~/utility/LogMessage.js";
import { Env } from "~/utility.js";

/** Convert GroupMe API message data to GroupMeMessage Model
 * @throws GroupMeMessageParseError
 */
export async function parse(json: IMessage): Promise<Message> {
  return new Message(
    json.id,
    new Member(json.user_id, json.name, json.avatar_url),
    json.group_id,
    new Date(json.created_at * 1000),
    json.text,
    await parseAttachments(json),
    json.system,
  );
}

async function parseAttachments(
  json: IMessage,
): Promise<GMAttachments.Attachment[]> {
  const rawAttachments: IAttachment[] = json.attachments;
  const attachments: GMAttachments.Attachment[] = [];

  for (const raw of rawAttachments) {
    switch (raw.type) {
      case "image": {
        attachments.push(await parseImageAttachment(raw));
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
        attachments.push(await parseFileAttachment(json, raw));
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
 * Extract GroupMe Image data
 * @param raw -
 *
 * @Throws GroupMeMessageParseError
 */
async function parseImageAttachment(
  raw: IAttachment,
): Promise<GMAttachments.Attachment> {
  const imgUrl = raw.url;
  const re: RegExp = /\w+(?=\.\w{32}$)/;

  const extensionSearch = re.exec(imgUrl);
  if (!extensionSearch) {
    throw new GroupMeMessageParseError(
      `Failed to parse image type from ${imgUrl}`,
    );
  }
  const extension = extensionSearch[0];

  const imgName = "GroupMeImage." + extension;
  const image = await GroupMeFileController.getFile(imgUrl);

  return new GMAttachments.ImageAttachment(imgName, image);
}

/**
 * Extract GroupMe Emoji data
 * @param raw -
 *
 * @throws GroupMeMessageParseError
 */
function parseEmojiAttachment(raw: IAttachment): GMAttachments.Attachment {
  const placeholder = raw.placeholder;
  const charmap = raw.charmap;
  return new GMAttachments.EmojiAttachment(placeholder, charmap);
}

/**
 * Extract GroupMe Location data
 * @param raw -
 *
 * @throws GroupMeMessageParseError
 */
function parseLocationAttachment(raw: IAttachment): GMAttachments.Attachment {
  const name = raw.name;
  const lat = raw.lat;
  const lng = raw.lng;
  return new GMAttachments.LocationAttachment(name, lat, lng);
}

/**
 * Extract GroupMe Split data
 * @param raw -
 *
 * @throws GroupMeMessageParseError
 */
function parseSplitAttachment(raw: IAttachment): GMAttachments.Attachment {
  const token = raw.token;
  return new GMAttachments.SplitAttachment(token);
}

/**
 * Extract GroupMe Video data
 * @param raw -
 *
 * @throws GroupMeMessageParseError
 */
function parseVideoAttachment(raw: IAttachment): GMAttachments.Attachment {
  const vidUrl = raw.url;
  return new GMAttachments.VideoAttachment(vidUrl);
}

/**
 * Extract GroupMe File data
 * @param raw -
 * @param json -
 *
 * @throws GroupMeMessageParseError
 */
async function parseFileAttachment(
  json: IMessage,
  raw: IAttachment,
): Promise<GMAttachments.Attachment> {
  Env.init();

  const fileId = raw.file_id;
  const token = Env.getRequired(Env.REQUIRED.GROUPME_TOKEN);
  const fileURL = `https://file.groupme.com/v1/${json.group_id}/files/${fileId}?token=${token}`;
  const fileData = await GroupMeFileController.getFile(fileURL);
  const fileName = await GroupMeFileController.getFileName(fileURL);

  return new GMAttachments.FileAttachment(fileURL, fileName, fileData);
}

/**
 * Extract GroupMe Reply data
 * @param raw -
 *
 * @throws GroupMeMessageParseError
 */
function parseReplyAttachment(raw: IAttachment): GMAttachments.Attachment {
  const replyID = raw.reply_id;
  return new GMAttachments.ReplyAttachment(replyID);
}

/**
 * Extract GroupMe Mentions Data
 * @param raw -
 *
 * @throws GroupMeMessageParseError
 */
function parseMentionsAttachment(raw: IAttachment): GMAttachments.Attachment {
  const userIDs = raw.user_ids;
  const loci = raw.loci;
  return new GMAttachments.MentionsAttachment(userIDs, loci);
}

/**
 * Extract GroupMe Poll Data
 * @param raw -
 *
 * @throws GroupMeMessageParseError
 */
function parsePollAttachment(raw: IAttachment): GMAttachments.Attachment {
  const pollID = raw.id;
  return new GMAttachments.PollAttachment(pollID);
}

/**
 * Extract GroupMe Event data
 * @param raw -
 *
 * @throws GroupMeMessageParseError
 */
function parseEventAttachment(raw: IAttachment): GMAttachments.Attachment {
  const eventID = raw.id;
  return new GMAttachments.EventAttachment(eventID);
}
