import { GroupMeAttachment } from "../models/GroupMeAttachment";
import GroupMeMember from "../models/GroupMeMember";
import GroupMeMessage from "../models/GroupMeMessage";

export function parceMessage(json) {
    const id:string = json.id;
    const member = new GroupMeMember(json.user_id, json.name, json.avatar_url);
    const groupID:string = json.group_id;
    const createdOn = new Date(json.created_at);
    const text = json.text;
    const attachments:GroupMeAttachment[] = [];
    const rawAttachments:any[] = json.attachments;
    for(const raw of rawAttachments) {
        //TODO: convert attachments
    }
    return new GroupMeMessage(id, member, groupID, createdOn, text, attachments);
}