import { TextBasedChannel, TextChannel } from "discord.js";
import { WARN } from "../utility/LogMessage";

export default class WebHooksHandler {

    public async getWebHookByName(channel:TextBasedChannel, name:string, avatar?:string) {
        const webhooks = await this.getWebHooks(channel);
        if(!webhooks) return;

        const firstCheck =  webhooks.filter(wh => wh.name === name);
        if(firstCheck.length === 1) return firstCheck[0];

        const secondCheck = webhooks.filter(wh => wh.avatarURL() === avatar);
        return secondCheck[0];
    }

    private async getWebHooks(channel:TextBasedChannel) {
        if(!channel || !(channel instanceof TextChannel)) {
            WARN("Invalid Channel");
            return;
        }
        const collection =  await channel.fetchWebhooks();
        return collection.map(wh => wh);
    }

    public async createWebHook(channel:TextBasedChannel, name:string, avatar:string) {
        if(!channel || !(channel instanceof TextChannel)) {
            WARN("Invalid Channel");
            return;
        }
        return await channel.createWebhook({ name, avatar });
    }
}