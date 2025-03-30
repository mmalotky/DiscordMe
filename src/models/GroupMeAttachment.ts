import { Stream } from "stream";

/** Class Definitions for GroupMe Attachments */

export class GroupMeAttachment {
  name: string;
  content: string;
  data: Stream;
  list: string[];
  map: number[][];
}

export class GroupMeImageAttachment extends GroupMeAttachment {
  constructor(name: string, data: Stream) {
    super();
    this.name = name;
    this.data = data;
  }
}

export class GroupMeVideoAttachment extends GroupMeAttachment {
  constructor(url: string) {
    super();
    this.content = url;
  }
}

export class GroupMeFileAttachment extends GroupMeAttachment {
  constructor(name: string, id: string) {
    super();
    this.name = name;
    this.content = id;
  }
}

export class GroupMeLocationAttachment extends GroupMeAttachment {
  constructor(name: string, lat: string, lng: string) {
    super();
    this.content = name;
    this.list = [lat, lng];
  }
}

export class GroupMeEmojiAttachment extends GroupMeAttachment {
  constructor(placeholder: string, charmap: number[][]) {
    super();
    this.content = placeholder;
    this.map = charmap;
  }
}

export class GroupMeSplitAttachment extends GroupMeAttachment {
  constructor(token: string) {
    super();
    this.content = token;
  }
}

export class GroupMeMentionsAttachment extends GroupMeAttachment {
  constructor(userIDs: string[], loci: number[][]) {
    super();
    this.list = userIDs;
    this.map = loci;
  }
}

export class GroupMeReplyAttachment extends GroupMeAttachment {
  constructor(replyID: string) {
    super();
    this.content = replyID;
  }
}

export class GroupMePollAttachment extends GroupMeAttachment {
  constructor(id: string) {
    super();
    this.content = id;
  }
}

export class GroupMeEventAttachment extends GroupMeAttachment {
  constructor(id: string) {
    super();
    this.content = id;
  }
}
