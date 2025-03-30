import { TextBasedChannel, TextChannel, Webhook } from "discord.js";
import { ConfigurationError } from "../errors";
import GroupMeMessage from "../models/GroupMeMessage";
import GroupMeController from "./GroupMeController";

export default class WebHooksHandler {
    /** Manage Discord Webhooks */

    private groupMeController:GroupMeController;

    constructor(groupMeController:GroupMeController) {
        this.groupMeController = groupMeController;
    }
    
    /**
     * Retrieve Webhook by name
     * @param channel Discord Channel
     * @param name search string
     * @param avatar
     * @returns Webhook
     */
    public async getWebHookByName(channel:TextBasedChannel, name:string):Promise<Webhook | undefined> {
        const webhooks = await this.getWebHooks(channel);
        if(!webhooks) return;
        const filter = webhooks.filter(wh => wh.name === name);
        if(filter.length == 0) return;
        return filter[0];
    }

    /** Utility function to retrieve webhooks for a given channel */
    private async getWebHooks(channel:TextBasedChannel) {
        if(!channel || !(channel instanceof TextChannel)) {
            throw new ConfigurationError(`Channel ${channel} not found.`);
        }
        const collection =  await channel.fetchWebhooks();
        return collection.map(wh => wh);
    }

    /**
     * Creates a new webhook for a discord channel, must clear webhooks if exceeds limit
     * @param channel Discord Channel
     * @param name Webhook name
     * @param avatar Webhook Avatar URL
     * @returns null or webhook promise
     * @throws GroupMeMessageParseError
     */
    public async createWebHook(channel:TextBasedChannel, message:GroupMeMessage):Promise<Webhook> {
        if(!channel || !(channel instanceof TextChannel)) {
            throw new ConfigurationError(`Channel ${channel} not found.`);
        }

        const webHooks = await this.getWebHooks(channel);
        if(webHooks.length === 15) {
            webHooks.forEach(wh => wh.delete());
        }

        const name = message.getMember().getName();
        const avatar = message.getIsSystem() ?
            "https://cdn.groupme.com/images/og_image_poundie.png" :
            "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg";
        
        return channel.createWebhook({ name, avatar });
    }
}