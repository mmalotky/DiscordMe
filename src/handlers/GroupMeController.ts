import { error } from "console";
import GroupMeChannel from "../models/GroupMeChannel";
import { ERR } from "../utility/LogMessage";
import GroupMeMessage from "../models/GroupMeMessage";
import { GroupMeAPIMessage, parceGroupMeMessage } from "../utility/MessageParcer";

export default class GroupMeController {
    private GROUPME_TOKEN:string;

    private GROUPME_URL:string = "https://api.groupme.com/v3";

    public setToken(token?:string) {
        if(token) this.GROUPME_TOKEN = token;
        else ERR("No GroupMe token defined.");
    }

    public async getChannelByName(name:string) {
        const channels = await this.getChannels();
        return channels.filter(c => c.getName() === name);
    }

    private async getChannels() {
        const channels:GroupMeChannel[] = [];
        let page:number = 0;
        let pageChannels:GroupMeChannel[] | undefined;
        do {
            page++;
            pageChannels = await this.getPageChannels(page);
            if(!pageChannels) break;
            channels.push(...pageChannels);
        } while(pageChannels.length !== 0);

        return channels;
    }
    
    private async getPageChannels(page:number) {
        try{
            const url = `${this.GROUPME_URL}/groups?token=${this.GROUPME_TOKEN}&page=${page}`;
            const response:Response = await fetch(url);
            if(response.status !== 200) throw error(`Request failed with status ${response.status}`);

            const json = await response.json();
            const data:GroupMeAPIMessage[] = json.response;
            const channels = data.map(ch => new GroupMeChannel(ch.id, ch.name));
            return channels;
        }
        catch(e) {
            ERR(e);
        }
    }

    public async getMessages(channel:GroupMeChannel) {
        const messages:GroupMeMessage[] = [];
        let messagePage:GroupMeMessage[] | void;
        let lastID:string = `${channel.getLastMessageID()}`;
        
        do {
            messagePage = await this.getMessagesAfterID(channel.getID(), lastID);
            if(messagePage == null) return messages;
            messages.push(...messagePage);

            if(messagePage.length > 0) {
                lastID = messagePage[messagePage.length - 1].getID();
            }
        } while(messagePage.length > 0);

        return messages;
    }

    private async getMessagesAfterID(channelID:string, lastID:string) {
        try{
            const url = `${this.GROUPME_URL}/groups/${channelID}/messages?token=${this.GROUPME_TOKEN}&after_id=${lastID}`;
            const response = await fetch(url);
            if(response.status !== 200) throw error(`Request failed with status ${response.status}`);

            const json = await response.json();
            const raw:GroupMeAPIMessage[] = json.response.messages;
            const messages:GroupMeMessage[] = [];

            for(const data of raw) {
                const message = parceGroupMeMessage(data);
                messages.push(message);
            }

            return messages;
        } catch(err) {
            ERR(err);
        }
    }
}