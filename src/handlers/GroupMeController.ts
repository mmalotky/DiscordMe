import { error } from "console";
import GroupMeChannel from "../models/GroupMeChannel";
import { ERR } from "../utility/LogMessage";
import GroupMeMessage from "../models/GroupMeMessage";
import GroupMeFileController from "./GroupMeFileController";
import {
  GroupMeAPIMessage,
  parseGroupMeMessage,
} from "../utility/MessageParser";
import { GroupMeMessageFetchError } from "../errors";

export default class GroupMeController {
  /**
   * Send data requests to GroupMe
   */

  private GROUPME_TOKEN: string;

  private GROUPME_URL: string = "https://api.groupme.com/v3";

  private fileController = new GroupMeFileController();

  /** Set the GroupMe Access Token */
  public setToken(token?: string) {
    if (token) {
      this.GROUPME_TOKEN = token;
    } else ERR("No GroupMe token defined.");
  }

  /** Get the GroupMe Channel Model from the name */
  public async getChannelByName(name: string) {
    const channels = await this.getChannels();
    return channels.filter((c) => c.getName() === name);
  }

  /** Get a list of available GroupMe Channels */
  private async getChannels() {
    const channels: GroupMeChannel[] = [];
    let page: number = 0;
    let pageChannels: GroupMeChannel[] | undefined;
    do {
      page++;
      pageChannels = await this.getPageChannels(page);
      if (!pageChannels) break;
      channels.push(...pageChannels);
    } while (pageChannels.length !== 0);

    return channels;
  }

  /** Utility function for iterating through pages of the GroupMe Channel List */
  private async getPageChannels(page: number) {
    try {
      const url = `${this.GROUPME_URL}/groups?token=${this.GROUPME_TOKEN}&page=${page}`;
      const response: Response = await fetch(url);
      if (response.status !== 200)
        throw error(`Request failed with status ${response.status}`);

      const json = await response.json();
      const data: GroupMeAPIMessage[] = json.response;
      const channels = data.map((ch) => new GroupMeChannel(ch.id, ch.name));
      return channels;
    } catch (e) {
      ERR(e);
    }
  }

  /** Get the messages from a GroupMe Channel staring from the last message ID in persistent data */
  public async getMessages(channel: GroupMeChannel): Promise<GroupMeMessage[]> {
    const messages: GroupMeMessage[] = [];
    let messagePage: GroupMeMessage[];
    let lastID: string = `${channel.getLastMessageID()}`;

    do {
      messagePage = await this.getMessagesAfterID(channel.getID(), lastID);
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
  private async getMessagesAfterID(
    channelID: string,
    lastID: string
  ): Promise<GroupMeMessage[]> {
    const url = `${this.GROUPME_URL}/groups/${channelID}/messages?token=${this.GROUPME_TOKEN}&after_id=${lastID}`;

    const response = await fetch(url);
    if (response.status !== 200)
      throw new GroupMeMessageFetchError(`STATUS: ${response.status}`);

    const json = await response.json();
    const raw: GroupMeAPIMessage[] = json.response.messages;
    const messages: GroupMeMessage[] = [];

    for (const data of raw) {
      messages.push(await parseGroupMeMessage(data, this.fileController, this.GROUPME_TOKEN));
    }
    return messages;
  }

  public async getImage(url: string) {
    return this.fileController.getFile(url);
  }
}