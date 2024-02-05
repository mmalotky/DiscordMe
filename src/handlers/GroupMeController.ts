import { error } from "console";
import GroupMeChannel from "../models/GroupMeChannel";

export default class GroupMeController {
    private GROUPME_TOKEN:string;

    private GROUPME_URL:string = "https://api.groupme.com/v3";

    public setToken(token?:string) {
        if(token) this.GROUPME_TOKEN = token;
        else console.error("No GroupMe token defined.");
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
            const data:any[] = json.response;
            const channels = data.map(ch => new GroupMeChannel(ch.id, ch.name));
            return channels;
        }
        catch(e) {
            console.error(e);
        }
    }
}