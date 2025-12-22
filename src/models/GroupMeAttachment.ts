/** Class Definitions for GroupMe Attachments */

export class GroupMeAttachment {
  name: string | undefined;
  content: string | undefined;
  data: Buffer | undefined;
  list: string[] | undefined;
  map: number[][] | undefined;

  constructor() {}
}

export class GroupMeImageAttachment extends GroupMeAttachment {
  name: string;
  data: Buffer;

  constructor(name: string, data: Buffer) {
    super();
    this.name = name;
    this.data = data;
  }
}

export class GroupMeVideoAttachment extends GroupMeAttachment {
  content: string;

  constructor(url: string) {
    super();
    this.content = url;
  }
}

export class GroupMeFileAttachment extends GroupMeAttachment {
  name: string;
  content: string;
  data: Buffer;

  constructor(url: string, id: string, data: Buffer) {
    super();
    this.content = url;
    this.name = id;
    this.data = data;
  }
}

export class GroupMeLocationAttachment extends GroupMeAttachment {
  content: string;
  list: string[];

  constructor(name: string, lat: string, lng: string) {
    super();
    this.content = name;
    this.list = [lat, lng];
  }
}

export class GroupMeEmojiAttachment extends GroupMeAttachment {
  content: string;
  map: number[][];

  constructor(placeholder: string, charmap: number[][]) {
    super();
    this.content = placeholder;
    this.map = charmap;
  }
}

export class GroupMeSplitAttachment extends GroupMeAttachment {
  content: string;

  constructor(token: string) {
    super();
    this.content = token;
  }
}

export class GroupMeMentionsAttachment extends GroupMeAttachment {
  list: string[];
  map: number[][];

  constructor(userIDs: string[], loci: number[][]) {
    super();
    this.list = userIDs;
    this.map = loci;
  }
}

export class GroupMeReplyAttachment extends GroupMeAttachment {
  content: string;

  constructor(replyID: string) {
    super();
    this.content = replyID;
  }
}

export class GroupMePollAttachment extends GroupMeAttachment {
  content: string;

  constructor(id: string) {
    super();
    this.content = id;
  }
}

export class GroupMeEventAttachment extends GroupMeAttachment {
  content: string;

  constructor(id: string) {
    super();
    this.content = id;
  }
}
