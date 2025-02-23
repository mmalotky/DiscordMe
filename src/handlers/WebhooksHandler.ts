import { TextBasedChannel, TextChannel } from "discord.js";
import { WARN } from "../utility/LogMessage";

export default class WebHooksHandler {
    /** Manage Discord Webhooks */
    
    /**
     * Retrieve Webhook by name
     * @param channel Discord Channel
     * @param name search string
     * @param avatar
     * @returns Webhook
     */
    public async getWebHookByName(channel:TextBasedChannel, name:string, avatar?:string) {
        const webhooks = await this.getWebHooks(channel);
        if(!webhooks) return;

        const firstCheck =  webhooks.filter(wh => wh.name === name);
        if(firstCheck.length === 1) return firstCheck[0];

        const secondCheck = webhooks.filter(wh => wh.avatarURL() === avatar);
        return secondCheck[0];
    }

    /** Utility function to retirve webhooks for a given channel */
    private async getWebHooks(channel:TextBasedChannel) {
        if(!channel || !(channel instanceof TextChannel)) {
            WARN("Invalid Channel");
            return;
        }
        const collection =  await channel.fetchWebhooks();
        return collection.map(wh => wh);
    }

    /**
     * Creates a new webhook for a discord channel
     * @param channel Discord Channel
     * @param name Webhook name
     * @param avatar Webhook Avatar URL
     * @returns null or webhook promise
     */
    public async createWebHook(channel:TextBasedChannel, name:string, avatar:string) {
        if(!channel || !(channel instanceof TextChannel)) {
            WARN("Invalid Channel");
            return;
        }
        return await channel.createWebhook({ name, avatar });
    }
}