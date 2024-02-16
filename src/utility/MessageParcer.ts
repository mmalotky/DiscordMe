import { APIEmbed, Colors, bold } from "discord.js";
import { GroupMeAttachment, GroupMeEmojiAttachment, GroupMeEventAttachment, GroupMeFileAttachment, GroupMeImageAttachment, GroupMeLocationAttachment, GroupMeMentionsAttachment, GroupMePollAttachment, GroupMeReplyAttachment, GroupMeSplitAttachment, GroupMeVideoAttachment } from "../models/GroupMeAttachment";
import GroupMeMember from "../models/GroupMeMember";
import GroupMeMessage from "../models/GroupMeMessage";
import { WARN } from "./LogMessage";
import { emojiMap } from "./GroupMeEmojiMap";

export type GroupMeAPIMessage = {
    id: string; 
    user_id: string; 
    name: string; 
    avatar_url: string; 
    group_id: string; 
    created_at: number; 
    text: string; 
    system: boolean; 
    attachments: GroupMeAPIAttachment[]; 
}

type GroupMeAPIAttachment = {
    type:string,
    url:string,
    placeholder:string,
    charmap:number[][],
    name:string,
    lng:string,
    lat:string,
    token:string,
    id:string,
    reply_id:string,
    user_ids:string[],
    loci:number[][]
};

export function parceGroupMeMessage(json: GroupMeAPIMessage) {
    const id = json.id;
    const member = new GroupMeMember(json.user_id, json.name, json.avatar_url);
    const groupID = json.group_id;
    const createdOn = new Date(json.created_at * 1000);
    const text = json.text;
    const isSystem = json.system;

    const attachments:GroupMeAttachment[] = [];
    const rawAttachments = json.attachments;
    for(const raw of rawAttachments) {
        switch(raw.type) {
            case "image": {
                const imgUrl = raw.url;
                const image = new GroupMeImageAttachment(imgUrl);
                attachments.push(image);
                break;
            }
            case "emoji": {
                const placeholder = raw.placeholder;
                const charmap = raw.charmap;
                const emoji = new GroupMeEmojiAttachment(placeholder, charmap);
                attachments.push(emoji);
                break;
            }
            case "location": {
                const name = raw.name;
                const lat = raw.lat;
                const lng = raw.lng;
                const location = new GroupMeLocationAttachment(name, lat, lng);
                attachments.push(location);
                break;
            }
            case "split": {
                const token = raw.token;
                const split = new GroupMeSplitAttachment(token);
                attachments.push(split);
                break;
            }
            case "video": {
                const vidUrl = raw.url;
                const video = new GroupMeVideoAttachment(vidUrl);
                attachments.push(video);
                break;
            }
            case "file": {
                const filId = raw.id;
                const file = new GroupMeFileAttachment(filId);
                attachments.push(file);
                break;
            }
            case "reply": {
                const replyID = raw.reply_id;
                const reply = new GroupMeReplyAttachment(replyID);
                attachments.push(reply);
                break;
            }
            case "mentions": {
                const userIDs = raw.user_ids;
                const loci = raw.loci;
                const mentions = new GroupMeMentionsAttachment(userIDs, loci);
                attachments.push(mentions);
                break;
            }
            case "poll": {
                const pollID = raw.id;
                const poll = new GroupMePollAttachment(pollID);
                attachments.push(poll);
                break;
            }
            case "event": {
                const eventID = raw.id;
                const event = new GroupMeEventAttachment(eventID);
                attachments.push(event);
                break;
            }
            default: {
                WARN(`Attatchment type ${raw.type} not recognised.`);
            }
        }
    }

    return new GroupMeMessage(id, member, groupID, createdOn, text, attachments, isSystem);
}

export function parceDiscordMessage(gmMessage:GroupMeMessage) {
    const tag = getTag(gmMessage);
    const content = getContent(gmMessage);
    const embeds = getEmbeds(gmMessage);
    
    return {
        content: tag + content,
        embeds: embeds
    }
}

function getTag(gmMessage:GroupMeMessage) {
    const time = `<t:${Math.floor(gmMessage.getCreatedOn().getTime()/1000)}>`;
    return `[${ time }]   `;
}

function getContent(gmMessage:GroupMeMessage) {
    const attachments = gmMessage.getAttachments();
    const emojis = attachments.filter(a => a instanceof GroupMeEmojiAttachment);
    let text = gmMessage.getText()? gmMessage.getText() : "";
    
    for(const emoji of emojis) {
        const placeholder = emoji.content;

        for(let i = 0; i < emoji.map.length; i++) {
            const index = emoji.map[i][0];
            if(emojiMap.length < index + 1) {
                WARN("Emoji not yet implemented")
                continue;
            }
            const pick = emoji.map[i][1];
            if(emojiMap[index].length < pick + 1) {
                WARN("Emoji not yet implemented")
                continue;
            }
            const emojiID = emojiMap[index][pick];
            text = text.replace(placeholder, emojiID);
        }
    }
    return text;
}

function getEmbeds(gmMessage:GroupMeMessage) {
    const attachments:GroupMeAttachment[] = gmMessage.getAttachments();
    const embeds:APIEmbed[] = [];

    const images = attachments.filter(a => a instanceof GroupMeImageAttachment)
        .map(a => {
            const url = a.content;          
            return {
                image: {
                    title: "GroupMe Image",
                    url:url
                }
            }
        });
    const videos = attachments.filter(a => a instanceof GroupMeVideoAttachment)
        .map(a => {
            const url = a.content
            return {
                video: {
                    title: "GroupMe Video",
                    url:url
                }
            }
        });
    
    embeds.push(...images, ...videos);

    return embeds;
}