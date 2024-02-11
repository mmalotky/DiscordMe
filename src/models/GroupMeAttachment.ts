export interface GroupMeAttachment {
    attachmentType: GroupMeAttachmentType;
}

export enum GroupMeAttachmentType {
    IMAGE = "image",
    EMOJI = "emoji",
    LOCATION = "location",
    SPLIT = "split",
    VIDEO = "video",
    FILE = "file",
    REPLY = "reply",
    MENTIONS = "mentions"
}

export class GroupMeImageAttachment implements GroupMeAttachment {
    attachmentType:GroupMeAttachmentType = GroupMeAttachmentType.IMAGE;
    private url:string;

    constructor(url:string) {
        this.url = url;
    }

    getURL() {
        return this.url;
    }
}

export class GroupMeVideoAttachment implements GroupMeAttachment {
    attachmentType:GroupMeAttachmentType = GroupMeAttachmentType.VIDEO;
    private url:string;

    constructor(url:string) {
        this.url = url;
    }

    getURL() {
        return this.url;
    }
}

export class GroupMeFileAttachment implements GroupMeAttachment {
    attachmentType:GroupMeAttachmentType = GroupMeAttachmentType.FILE;
    private url:string;

    constructor(url:string) {
        this.url = url;
    }

    getURL() {
        return this.url;
    }
}

export class GroupMeLocationAttachment implements GroupMeAttachment {
    attachmentType:GroupMeAttachmentType = GroupMeAttachmentType.LOCATION;
    private name:string;
    private lat:string;
    private lng:string;

    constructor(name:string, lat:string, lng:string) {
        this.name = name;
        this.lat = lat;
        this.lng = lng;
    }

    getName() {
        return this.name;
    }

    getCoords() {
        return [this.lat, this.lng];
    }
}

export class GroupMeEmojiAttachment implements GroupMeAttachment {
    attachmentType: GroupMeAttachmentType = GroupMeAttachmentType.EMOJI;
    private placeholder: string;
    private charmap: number[][];
    
    constructor(placeholder:string, charmap:number[][]) {
        this.placeholder = placeholder;
        this.charmap = charmap;
    }

    getPlaceholder() {
        return this.placeholder;
    }

    getCharmap() {
        return this.charmap;
    }
}

export class GroupMeSplitAttachment implements GroupMeAttachment {
    attachmentType: GroupMeAttachmentType = GroupMeAttachmentType.SPLIT;
    private token : string;

    constructor(token: string) {
        this.token = token;
    }

    getToken() {
        return this.token;
    }
}

export class GroupMeMentionsAttachment implements GroupMeAttachment {
    attachmentType:GroupMeAttachmentType = GroupMeAttachmentType.MENTIONS;
    private userIDs:string[];
    private loci: number[][];

    constructor(userIDs:string[], loci:number[][]) {
        this.userIDs = userIDs;
        this.loci = loci;

    }

    getUserIDs() {
        return this.userIDs;
    }

    getLoci() {
        return this.loci;
    }
}

export class GroupMeReplyAttachment implements GroupMeAttachment {
    attachmentType:GroupMeAttachmentType = GroupMeAttachmentType.REPLY;
    private replyID:string;

    constructor(replyID:string) {
        this.replyID = replyID;
    }

    getReplyID() {
        return this.replyID;
    }
}