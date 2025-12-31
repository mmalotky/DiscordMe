import GroupMeChannel from "~/models/GroupMeChannel.js";
import { ERR } from "~/utility/LogMessage.js";
import GroupMeMessage from "~/models/GroupMeMessage.js";
import {
  GroupMeAPIMessage,
  parseGroupMeMessage,
} from "~/utility/MessageParser.js";
import { GroupMeMessageFetchError } from "~/errors.js";

/**
 * Send data requests to GroupMe
 */

let GROUPME_TOKEN: string;

const GROUPME_URL: string = "https://api.groupme.com/v3";

/** Set the GroupMe Access Token */
export function setToken(token: string | undefined) {
  if (token) {
    GROUPME_TOKEN = token;
  } else ERR("No GroupMe token defined.");
}

/** Get the GroupMe Channel Model from the name */
export async function getChannelByName(name: string) {
  const channels = await getChannels();
  return channels.filter((c) => c.getName() === name);
}

/** Get a list of available GroupMe Channels */
export async function getChannels() {
  const channels: GroupMeChannel[] = [];
  let page: number = 0;
  let pageChannels: GroupMeChannel[] | undefined;
  do {
    page++;
    pageChannels = await getPageChannels(page);
    if (!pageChannels) break;
    channels.push(...pageChannels);
  } while (pageChannels.length !== 0);

  return channels;
}

/** Utility function for iterating through pages of the GroupMe Channel List */
async function getPageChannels(page: number) {
  try {
    const url = `${GROUPME_URL}/groups?token=${GROUPME_TOKEN}&page=${page}`;
    const response: Response = await fetch(url);
    if (response.status !== 200)
      throw new GroupMeMessageFetchError(
        `Request failed with status ${response.status}`,
      );

    const json = (await response.json()) as { response: GroupMeAPIMessage[] };
    const data: GroupMeAPIMessage[] = json.response;
    const channels = data.map((ch) => new GroupMeChannel(ch.id, ch.name));
    return channels;
  } catch (err) {
    ERR(err);
    throw err;
  }
}

/** Get the messages from a GroupMe Channel staring from the last message ID in persistent data */
export async function getMessages(
  channel: GroupMeChannel,
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
