import * as GroupMe from "~/groupMe.js";
import GroupMeMessage from "~/models/GroupMeMessage.js";
import {
  GroupMeAPIMessage,
  parseGroupMeMessage,
} from "~/utility/MessageParser.js";
import { GroupMeMessageFetchError } from "~/errors.js";
import { Env } from "~/utility.js";

/**
 * Send data requests to GroupMe
 */

const GROUPME_URL: string = "https://api.groupme.com/v3";

/** Get the messages from a GroupMe Channel staring from the last message ID in persistent data */
export async function getMessages(
  channel: GroupMe.Group,
): Promise<GroupMeMessage[]> {
  const messages: GroupMeMessage[] = [];
  let messagePage: GroupMeMessage[];
  let lastID: string = `${channel.getLastMessageID()}`;

  do {
    messagePage = await getMessagesAfterID(channel.getID(), lastID);
    if (messagePage == null) return messages;
    messages.push(...messagePage);

    if (messagePage.length > 0) {
      lastID = messagePage[messagePage.length - 1].getID();
    }
  } while (messagePage.length > 0);

  return messages;
}

/** Utility function for iterating through pages of channel messages
 *
 * @throws GroupMeMessageParseError
 * @throws GroupMeMessageFetchError
 */
async function getMessagesAfterID(
  channelID: string,
  lastID: string,
): Promise<GroupMeMessage[]> {
  Env.init();

  const GROUPME_TOKEN = Env.getRequired(Env.REQUIRED.GROUPME_TOKEN);
  const url = `${GROUPME_URL}/groups/${channelID}/messages?token=${GROUPME_TOKEN}&after_id=${lastID}`;

  const response = await fetch(url);
  if (response.status !== 200)
    throw new GroupMeMessageFetchError(`STATUS: ${response.status}`);

  const json = (await response.json()) as {
    response: { messages: GroupMeAPIMessage[] };
  };
  const raw: GroupMeAPIMessage[] = json.response.messages;
  const messages: GroupMeMessage[] = [];

  for (const data of raw) {
    messages.push(await parseGroupMeMessage(data));
  }
  return messages;
}
