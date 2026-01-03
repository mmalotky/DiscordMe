import * as Net from "../net.js";
import { Group, Message } from "../models.js";
import { MessageParser } from "../utility.js";
import { Log } from "~/utility.js";

/**
 * Send data requests to GroupMe
 */

/** Get the messages from a GroupMe Channel staring from the last message ID in persistent data */
export async function getMessages(group: Group): Promise<Message[]> {
  Log.INFO(`Fetching messages from GroupMe for (group:${group.getID()})`);
  const messages: Message[] = [];
  let messagePage: Message[];

  let firstPageID = group.getLastMessageID();
  do {
    messagePage = await fetchPage(group.getID(), firstPageID);
    if (messagePage == null) return messages;
    messages.push(...messagePage);

    if (messagePage.length > 0) {
      firstPageID = messagePage[messagePage.length - 1].getID();
    }
  } while (messagePage.length > 0);

  return messages;
}

/** Utility function for iterating through pages of channel messages
 *
 * @throws GroupMeMessageParseError
 * @throws GroupMeMessageFetchError
 */
async function fetchPage(groupID: string, pageID: string): Promise<Message[]> {
  Log.INFO(
    `Fetching message page #${pageID} from GroupMe for (group:${groupID})`,
  );
  const request: Net.api.IMessageIndexRequest = {
    endpoint: `groups/${groupID}/messages`,
    params: { after_id: `${pageID}` },
  };
  const response: Net.api.IMessageIndexResponse =
    await Net.api.fetchJSON(request);
  Net.api.validateIMessageIndexResponse(response);
  const messages: Message[] = [];
  for (const message of response.response.messages) {
    messages.push(...(await MessageParser.parse(message)));
  }
  return messages;
}
