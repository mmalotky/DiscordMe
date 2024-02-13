import { GroupMeAttachment, GroupMeEmojiAttachment, GroupMeEventAttachment, GroupMeFileAttachment, GroupMeImageAttachment, GroupMeLocationAttachment, GroupMeMentionsAttachment, GroupMePollAttachment, GroupMeReplyAttachment, GroupMeSplitAttachment, GroupMeVideoAttachment } from "../models/GroupMeAttachment";
import GroupMeMember from "../models/GroupMeMember";
import GroupMeMessage from "../models/GroupMeMessage";
import { WARN } from "./LogMessage";

export function parceMessage(json) {
    const id:string = json.id;
    const member = new GroupMeMember(json.user_id, json.name, json.avatar_url);
    const groupID:string = json.group_id;
    const createdOn = new Date(json.created_at);
    const text = json.text;
    const isSystem:boolean = json.system;

    const attachments:GroupMeAttachment[] = [];
    const rawAttachments:any[] = json.attachments;
    for(const raw of rawAttachments) {
        switch(raw.type) {
            case "image":
                const imgUrl:string = raw.url;
                const image = new GroupMeImageAttachment(imgUrl);
                attachments.push(image);
                break;
            case "emoji":
                const placeholder:string = raw.placeholder;
                const charmap:number[][] = raw.charmap;
                const emoji = new GroupMeEmojiAttachment(placeholder, charmap);
                attachments.push(emoji);
                break;
            case "location":
                const name:string = raw.name;
                const lat:string = raw.lat;
                const lng:string = raw.lng;
                const location = new GroupMeLocationAttachment(name, lat, lng);
                attachments.push(location);
                break;
            case "split":
                const token:string = raw.token;
                const split = new GroupMeSplitAttachment(token);
                attachments.push(split);
                break;
            case "video":
                const vidUrl:string = raw.url;
                const video = new GroupMeVideoAttachment(vidUrl);
                attachments.push(video);
                break;
            case "file":
                const filUrl:string = raw.url;
                const file = new GroupMeFileAttachment(filUrl);
                attachments.push(file);
                break;
            case "reply":
                const replyID = raw.reply_id;
                const reply = new GroupMeReplyAttachment(replyID);
                attachments.push(reply);
                break;
            case "mentions":
                const userIDs:string[] = raw.user_ids;
                const loci:number[][] = raw.loci;
                const mentions = new GroupMeMentionsAttachment(userIDs, loci);
                attachments.push(mentions);
                break;
            case "poll":
                const pollID = raw.id;
                const poll = new GroupMePollAttachment(pollID);
                attachments.push(poll);
                break;
            case "event":
                const eventID = raw.id;
                const event = new GroupMeEventAttachment(eventID);
                attachments.push(event);
                break;
            default:
                WARN(`Attatchment type ${raw.type} not recognised.`)
        }
    }

    return new GroupMeMessage(id, member, groupID, createdOn, text, attachments, isSystem);
}