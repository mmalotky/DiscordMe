import { Message } from "../models/Message.js";
import * as Net from "~/groupMe/net.js";
import { Group } from "../models.js";
import { MessageParser } from "../utility.js";

/**
 * Send data requests to GroupMe
 */

/** Get the messages from a GroupMe Channel staring from the last message ID in persistent data */
export async function getMessages(group: Group): Promise<Message[]> {
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
  const request: Net.api.IMessageIndexRequest = {
    endpoint: `groups/${groupID}/messages`,
    params: { after_id: `${pageID}` },
  };
  const response: Net.api.IMessageIndexResponse =
    await Net.api.fetchJSON(request);
  const messages: Message[] = [];
  response.response.forEach((message) => {
    MessageParser.parse(message)
      .then((m) => messages.push(m))
      .catch((err) => {
        throw err;
      });
  });
  return messages;
}
