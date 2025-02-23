import { GroupMeAttachment } from "./GroupMeAttachment";
import GroupMeMember from "./GroupMeMember";

export default class GroupMeMessage {
    /**
     * GroupMe Message Model
     */

    private id: string;
    private member: GroupMeMember;
    private groupID: string;
    private createdOn: Date;
    private text: string;
    private attachments:GroupMeAttachment[];
    private isSystem:boolean;

    constructor(
        id:string, 
        member:GroupMeMember, 
        groupId:string, 
        createdOn:Date, 
        text:string,
        attachments:GroupMeAttachment[],
        isSystem:boolean
    ) {
        this.id = id;
        this.member = member;
        this.groupID = groupId;
        this.createdOn = createdOn;
        this.text = text;
        this.attachments = attachments;
        this.isSystem = isSystem;
    }

    getID() {
        return this.id;
    }

    getMember() {
        return this.member;
    }

    getGroupID() {
        return this.groupID;
    }

    getCreatedOn() {
        return this.createdOn;
    }

    getText() {
        return this.text;
    }

    getAttachments() {
        return this.attachments;
    }

    getIsSystem() {
        return this.isSystem;
    }
}