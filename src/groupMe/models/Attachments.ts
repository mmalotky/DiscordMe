/** Class Definitions for GroupMe Attachments */

import * as Errors from "~/errors.js";
import * as Net from "../net.js";
import * as GroupMeFileController from "~/handlers/GroupMeFileController.js";
import { Env, Log } from "~/utility.js";

export enum Types {
  Image,
  Video,
  File,
  Location,
  Emoji,
  Split,
  Mentions,
  Reply,
  Poll,
  Event,
}

export class Attachment {
  type: Types | undefined;
  name: string | undefined;
  content: string | undefined;
  data: Buffer | undefined;
  list: string[] | undefined;
  map: number[][] | undefined;

  protected constructor() {}
}

class ImageAttachment extends Attachment {
  type: Types.Image;
  name: string;
  data: Buffer;

  private constructor(name: string, data: Buffer) {
    super();
    this.type = Types.Image;
    this.name = name;
    this.data = data;
  }

  /**
   * Extract GroupMe Image data
   * @param raw -
   *
   * @Throws GroupMeMessageParseError
   */
  static async fromApi(
    attachment: Net.api.IAttachment,
  ): Promise<ImageAttachment> {
    const url = attachment.url;
    assertNotMissing("url", url);

    const re: RegExp = /\w+(?=\.\w{32}$)/;

    const extensionSearch = re.exec(url);
    if (!extensionSearch) {
      throw new Errors.net.Parse(`image type from ${url}`);
    }
    const extension = extensionSearch[0];

    return new ImageAttachment(
      "GroupMeImage." + extension,
      await GroupMeFileController.getFile(url),
    );
  }
}

class VideoAttachment extends Attachment {
  types: Types.Video;
  content: string;

  private constructor(url: string) {
    super();
    this.types = Types.Video;
    this.content = url;
  }
  /**
   * Extract GroupMe Video data
   * @param raw -
   *
   * @throws GroupMeMessageParseError
   */
  static fromApi(attachment: Net.api.IAttachment): VideoAttachment {
    const vidUrl = attachment.url;
    assertNotMissing("url", vidUrl);
    return new VideoAttachment(vidUrl);
  }
}

class FileAttachment extends Attachment {
  type: Types.File;
  name: string;
  content: string;
  data: Buffer;

  private constructor(url: string, id: string, data: Buffer) {
    super();
    this.type = Types.File;
    this.content = url;
    this.name = id;
    this.data = data;
  }
  /**
   * Extract GroupMe File data
   * @param raw -
   * @param json -
   *
   * @throws GroupMeMessageParseError
   */
  static async fromApi(
    attachment: Net.api.IAttachment,
    msg: Net.api.IMessage,
  ): Promise<FileAttachment> {
    Env.init();

    const fileId = attachment.file_id;
    assertNotMissing("file_id", fileId);
    const token = Env.getRequired(Env.REQUIRED.GROUPME_TOKEN);
    const fileURL = `https://file.groupme.com/v1/${msg.group_id}/files/${fileId}?token=${token}`;
    const fileData = await GroupMeFileController.getFile(fileURL);
    const fileName = await GroupMeFileController.getFileName(fileURL);

    return new FileAttachment(fileURL, fileName, fileData);
  }
}

class LocationAttachment extends Attachment {
  type: Types.Location;
  content: string;
  list: string[];

  private constructor(name: string, lat: string, lng: string) {
    super();
    this.type = Types.Location;
    this.content = name;
    this.list = [lat, lng];
  }

  /**
   * Extract GroupMe Location data
   * @param raw -
   *
   * @throws GroupMeMessageParseError
   */
  static fromApi(attachment: Net.api.IAttachment): LocationAttachment {
    const name = attachment.name;
    assertNotMissing("name", name);
    const lat = attachment.lat;
    assertNotMissing("lat", lat);
    const lng = attachment.lng;
    assertNotMissing("lng", lng);
    return new LocationAttachment(name, lat, lng);
  }
}

class EmojiAttachment extends Attachment {
  type: Types.Emoji;
  content: string;
  map: number[][];

  private constructor(placeholder: string, charmap: number[][]) {
    super();
    this.type = Types.Emoji;
    this.content = placeholder;
    this.map = charmap;
  }
  /**
   * Extract GroupMe Emoji data
   * @param raw -
   *
   * @throws GroupMeMessageParseError
   */
  static fromApi(raw: Net.api.IAttachment): EmojiAttachment {
    const placeholder = raw.placeholder;
    assertNotMissing("placeholder", placeholder);
    const charmap = raw.charmap;
    assertNotMissing("charmap", charmap);

    return new EmojiAttachment(placeholder, charmap);
  }
}

class SplitAttachment extends Attachment {
  type: Types.Split;
  content: string;

  private constructor(token: string) {
    super();
    this.type = Types.Split;
    this.content = token;
  }
  /**
   * Extract GroupMe Split data
   * @param raw -
   *
   * @throws GroupMeMessageParseError
   */
  static fromApi(raw: Net.api.IAttachment): SplitAttachment {
    const token = raw.token;
    assertNotMissing("token", token);
    return new SplitAttachment(token);
  }
}

class MentionsAttachment extends Attachment {
  type: Types.Mentions;
  list: string[];
  map: number[][];

  private constructor(userIDs: string[], loci: number[][]) {
    super();
    this.type = Types.Mentions;
    this.list = userIDs;
    this.map = loci;
  }
  /**
   * Extract GroupMe Mentions Data
   * @param raw -
   *
   * @throws GroupMeMessageParseError
   */
  static fromApi(raw: Net.api.IAttachment): MentionsAttachment {
    const userIDs = raw.user_ids;
    assertNotMissing("user_ids", userIDs);
    const loci = raw.loci;
    assertNotMissing("loci", loci);
    return new MentionsAttachment(userIDs, loci);
  }
}

class ReplyAttachment extends Attachment {
  type: Types.Reply;
  content: string;

  private constructor(replyID: string) {
    super();
    this.type = Types.Reply;
    this.content = replyID;
  }

  /**
   * Extract GroupMe Reply data
   * @param raw -
   *
   * @throws GroupMeMessageParseError
   */
  static fromApi(raw: Net.api.IAttachment): ReplyAttachment {
    const replyID = raw.reply_id;
    assertNotMissing("reply_id", replyID);
    return new ReplyAttachment(replyID);
  }
}

class PollAttachment extends Attachment {
  type: Types.Poll;
  content: string;

  private constructor(id: string) {
    super();
    this.type = Types.Poll;
    this.content = id;
  }
  /**
   * Extract GroupMe Poll Data
   * @param raw -
   *
   * @throws GroupMeMessageParseError
   */
  static fromApi(raw: Net.api.IAttachment): PollAttachment {
    const pollID = raw.id;
    assertNotMissing("id", pollID);
    return new PollAttachment(pollID);
  }
}

class EventAttachment extends Attachment {
  type: Types.Event;
  content: string;

  private constructor(id: string) {
    super();
    this.type = Types.Event;
    this.content = id;
  }
  /**
   * Extract GroupMe Event data
   * @param raw -
   *
   * @throws GroupMeMessageParseError
   */
  static fromApi(raw: Net.api.IAttachment): EventAttachment {
    const eventID = raw.id;
    assertNotMissing("id", eventID);
    return new EventAttachment(eventID);
  }
}

function assertNotMissing<R>(
  symbol: string,
  value: R | undefined,
): asserts value is R {
  if (value === undefined) throw new Errors.net.Parse(`missing ${symbol}`);
}

export async function fromApi(
  attachment: Net.api.IAttachment,
  msg: Net.api.IMessage,
): Promise<Attachment> {
  switch (attachment.type) {
    case "image":
      return await ImageAttachment.fromApi(attachment);
    case "emoji":
      return EmojiAttachment.fromApi(attachment);
    case "location":
      return LocationAttachment.fromApi(attachment);
    case "split":
      return SplitAttachment.fromApi(attachment);
    case "video":
      return VideoAttachment.fromApi(attachment);
    case "file":
      return await FileAttachment.fromApi(attachment, msg);
    case "reply":
      return ReplyAttachment.fromApi(attachment);
    case "mentions":
      return MentionsAttachment.fromApi(attachment);
    case "poll":
      return PollAttachment.fromApi(attachment);
    case "event":
      return EventAttachment.fromApi(attachment);
    default:
      Log.WARN(`Attachment type ${attachment.type} not recognized.`);
      throw new Errors.net.Parse(
        `unknown attachment type "${attachment.type}"`,
      );
  }
}
