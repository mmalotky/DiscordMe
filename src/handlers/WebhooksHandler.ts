import { TextBasedChannel, TextChannel, Webhook } from "discord.js";
import { ConfigurationError } from "../errors";
import GroupMeMessage from "../models/GroupMeMessage";

export default class WebHooksHandler {
    /** Manage Discord Webhooks */

    /**
     * Edits an existing webhook according to a GroupMe message
     * @param webHook webhook to edit
     * @param message message to apply to
     * @returns webhook
     */
    public async editWebhook(webHook:Webhook, message: GroupMeMessage):Promise<Webhook> {
        const name = message.getMember().getName();
        const avatar = message.getIsSystem() ?
            "https://cdn.groupme.com/images/og_image_poundie.png" :
            "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg";
        
        return webHook.edit({ name, avatar });
    }

    /**
     * Finds the webhook in a channel associated with the application id
     * @param channel Discord Channel
     * @returns Webhook attached to the application id
     */
    public async getWebhookByChannel(channel: TextBasedChannel): Promise<Webhook> {
        if(!channel || !(channel instanceof TextChannel)) {
            throw new ConfigurationError(`Channel ${channel} not found.`);
        }
        const applicationId = channel.client.application.id;

        const collection =  await channel.fetchWebhooks();
        const filter = collection.map(wh => wh).filter(wh => wh.applicationId === applicationId);
        return filter[0];
    }

    /**
     * Creates a new webhook for a discord channel
     * @param channel Discord Channel
     * @param name Webhook name
     * @param avatar Webhook Avatar URL
     * @returns null or webhook promise
     * @throws ConfigurationError
     */
    public async createWebHook(channel:TextBasedChannel, message:GroupMeMessage):Promise<Webhook> {
        if(!channel || !(channel instanceof TextChannel)) {
            throw new ConfigurationError(`Channel ${channel} not found.`);
        }

        const name = message.getMember().getName();
        const avatar = message.getIsSystem() ?
            "https://cdn.groupme.com/images/og_image_poundie.png" :
            "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg";
        
        return channel.createWebhook({ name, avatar });
    }
}