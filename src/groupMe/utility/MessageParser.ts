import { emojiMap } from "~/utility/GroupMeEmojiMap.js";
import { Member, Message, attachments } from "../models.js";
import { IAttachment, IMessage } from "../net/api.js";
import * as Errors from "~/errors.js";
import { Log } from "~/utility.js";
import * as Discord from "~/discord.js";

const MAX_MSG_CHARS = 2000 - 3; // pad with '...'

/** Convert GroupMe API message data to GroupMeMessage Model
 * @throws GroupMeMessageParseError
 */
export async function parse(msg: IMessage): Promise<Message[]> {
  const attachments = await parseAttachments(msg);
  const date = new Date(msg.created_at * 1000);
  const member = new Member(msg.user_id, msg.name, msg.avatar_url);

  const tag = `[<t:${Math.floor(msg.created_at)}>]   `;
  const text = fillInlineAttachments(msg.text, attachments);

  return split(tag + text).map((text) => {
    return new Message(
      msg.id,
      member,
      msg.group_id,
      date,
      text,
      attachments,
      msg.system,
    );
  });
}

async function parseAttachments(
  msg: IMessage,
): Promise<attachments.Attachment[]> {
  const rawAttachments: IAttachment[] = msg.attachments;
  const attachmentsList: attachments.Attachment[] = [];

  for (const rawAttachment of rawAttachments) {
    attachmentsList.push(await attachments.fromApi(rawAttachment, msg));
  }

  return attachmentsList;
}

function split(msg: string): string[] {
  const messages: string[] = [];
  let message = "";
  let firstString = true;

  msg.split(" ").forEach((snippet) => {
    if (snippet.length > MAX_MSG_CHARS) throw new Errors.net.Parse("too long");
    if (snippet.length + message.length > MAX_MSG_CHARS) {
      messages.push(message + "...");
      message = "..." + snippet;
      return;
    }

    if (!firstString) message += " ";
    firstString = false;
    message += snippet;
  });

  return messages;
}

/** FROM GM.ts
 function splitMessage(message: string) {
   const messageList: string[] = [];
   if (message.length <= 1500) {
     messageList.push(message);
     return messageList;
   }
 
   let i = 0;
   do {
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
 */

/** Utility function to add inline attachments to the GroupMe Message content body */
function fillInlineAttachments(text: string, att: attachments.Attachment[]) {
  const emojis = att.filter((a) => a.type === attachments.Types.Emoji);

  for (const emoji of emojis) {
    const placeholder = emoji.content;
    assertNotMissing("placeholder", placeholder);
    const charmap = emoji.map;
    assertNotMissing("charmap", charmap);

    for (let i = 0; i < charmap.length; i++) {
      const index = charmap[i][0] - 1;
      if (emojiMap.length < index + 1) {
        Log.WARN(`Emoji not yet implemented. Index: [${index}]`);
        continue;
      }
      const pick = charmap[i][1];
      if (emojiMap[index].length < pick + 1) {
        Log.WARN(`Emoji not yet implemented. Index: [${index}, ${pick}]`);
        continue;
      }
      const emojiID = emojiMap[index][pick];
      text = text.replace(placeholder, emojiID);
    }
  }
  return Discord.EmojiMap.parse(text);
}

function assertNotMissing<R>(
  symbol: string,
  value: R | undefined,
): asserts value is R {
  if (value === undefined) throw new Errors.net.Parse(`missing ${symbol}`);
}
