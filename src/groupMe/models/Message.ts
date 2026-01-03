import { Attachment } from "../models/Attachments.js";
import { Member } from "../models/Member.js";

export class Message {
  /**
   * GroupMe Message Model
   */

  private id: string;
  private member: Member;
  private groupID: string;
  private createdOn: Date;
  private text: string;
  private attachments: Attachment[];
  private isSystem: boolean;

  constructor(
    id: string,
    member: Member,
    groupId: string,
    createdOn: Date,
    text: string,
    attachments: Attachment[],
    isSystem: boolean,
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
    const id = this.id;
    return id;
  }

  getMember() {
    const member = this.member;
    return member;
  }

  getGroupID() {
    const groupID = this.groupID;
    return groupID;
  }

  getCreatedOn() {
    const createdOn = this.createdOn;
    return createdOn;
  }

  getText() {
    const text = this.text ? this.text : "";
    return text;
  }

  setText(text: string) {
    this.text = text;
  }

  getAttachments() {
    const attachments = [...this.attachments];
    return attachments;
  }

  setAttachments(attachments: Attachment[]) {
    this.attachments = attachments;
  }

  getIsSystem() {
    const isSystem = this.isSystem;
    return isSystem;
  }
}
