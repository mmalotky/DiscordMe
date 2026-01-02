/** Class Definitions for GroupMe Attachments */

export class Attachment {
  name: string | undefined;
  content: string | undefined;
  data: Buffer | undefined;
  list: string[] | undefined;
  map: number[][] | undefined;

  constructor() {}
}

export class ImageAttachment extends Attachment {
  name: string;
  data: Buffer;

  constructor(name: string, data: Buffer) {
    super();
    this.name = name;
    this.data = data;
  }
}

export class VideoAttachment extends Attachment {
  content: string;

  constructor(url: string) {
    super();
    this.content = url;
  }
}

export class FileAttachment extends Attachment {
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

export class LocationAttachment extends Attachment {
  content: string;
  list: string[];

  constructor(name: string, lat: string, lng: string) {
    super();
    this.content = name;
    this.list = [lat, lng];
  }
}

export class EmojiAttachment extends Attachment {
  content: string;
  map: number[][];

  constructor(placeholder: string, charmap: number[][]) {
    super();
    this.content = placeholder;
    this.map = charmap;
  }
}

export class SplitAttachment extends Attachment {
  content: string;

  constructor(token: string) {
    super();
    this.content = token;
  }
}

export class MentionsAttachment extends Attachment {
  list: string[];
  map: number[][];

  constructor(userIDs: string[], loci: number[][]) {
    super();
    this.list = userIDs;
    this.map = loci;
  }
}

export class ReplyAttachment extends Attachment {
  content: string;

  constructor(replyID: string) {
    super();
    this.content = replyID;
  }
}

export class PollAttachment extends Attachment {
  content: string;

  constructor(id: string) {
    super();
    this.content = id;
  }
}

export class EventAttachment extends Attachment {
  content: string;

  constructor(id: string) {
    super();
    this.content = id;
  }
}
