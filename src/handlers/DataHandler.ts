import fs from "fs";
import { readdir, readFile, rm } from "fs/promises";
import GroupMeChannel from "../models/GroupMeChannel";
import { WARN } from "../utility/LogMessage";

export default class DataHandler {
    /** Handles persistant data storage */
    private static DATA_PATH = "./data";

    /** 
     * stores configuations between Discord and GroupMe channels by creating a new
     * file labeled put under a folder for the DiscordID, named by the GroupMe Channel
     * ID. Does not update existing configuations.
     * 
     * @param discordID Discord channel ID
     * @param groupMeChannel GroupMe Channel Model
     */
    public static async addConfig(discordID:string, groupMeChannel:GroupMeChannel) {
        if(await this.checkConfig(discordID)) {
            WARN(`Channel ${discordID} already has a groupme channel assigned`);
            return false;
        }

        const path = this.getFilePath(discordID, groupMeChannel.getID());
        const folderPath = path.substring(0, path.lastIndexOf("/"));
        fs.mkdirSync(folderPath, {recursive: true});

        const json = JSON.stringify(groupMeChannel);
        fs.writeFile(path, json, (err) => this.handleIOErr(err));

        return true;
    }

    /**
     * Updates an existing configuration data between a groupMe and Discord Channel
     * 
     * @param discordID Discord Channel ID
     * @param groupMeChannel GroupMe Channel Model
     */
    public static async setConfig(discordID:string, groupMeChannel:GroupMeChannel) {
        if(!await this.checkConfig(discordID)) {
            WARN(`No config exists for channel ${discordID}`);
            return false;
        }
        const path = this.getFilePath(discordID, groupMeChannel.getID());
        const json = JSON.stringify(groupMeChannel);
        fs.writeFile(path, json, (err) => this.handleIOErr(err));
        return true;
    }

    /**
     * Removes an existing configuration for a Discord Channnel
     * 
     * @param discordID Discord Channel ID
     */
    public static async rmConfig(discordID:string) {
        try {
            const path = await this.checkConfig(discordID);
            if(!path) return false;
            await rm(path);
            return true;
        }
        catch(err) {
            this.handleIOErr(err);
            return false;
        }
    }

    /**
     * Gets the GroupMe Channel configured to a Discord Channel
     * 
     * @param discordID Discord channel ID
     * @returns null or GroupMe Channel Model
     */
    public static async getConfig(discordID:string) {
        try {
            const path = await this.checkConfig(discordID);
            if(!path) return;
            const data = await readFile(path, {encoding:"utf-8"});
            const json = JSON.parse(data);
            const channel = new GroupMeChannel(json.id, json.name);
            channel.setLastMessageID(json.lastMessageID);
            return channel;
        }
        catch(err) {
            this.handleIOErr(err);
        }
    }

    /** Utility Function to Check if the Discord channel has a configuration */
    private static async checkConfig(discordID:string) {
        try {
            const folderPath = `${this.DATA_PATH}/${discordID.substring(0,2)}/${discordID.substring(2)}`;
            const dir = await readdir(folderPath);
            return dir[0] ? `${folderPath}/${dir[0]}` : undefined;
        }
        catch(err) {
            this.handleIOErr(err);
        }
    }
    
    /** Utility function to get the filepath format for a given Discord ID and GroupMe ID */
    private static getFilePath(discordID:string, groupmeID:string) {
        return `${this.DATA_PATH}/${discordID.substring(0,2)}/${discordID.substring(2)}/${groupmeID}.json`;
    }

    /** Utility function to send IO error messages */
    private static handleIOErr(err: NodeJS.ErrnoException | null) {
        if(err) {
            WARN(err.message);
            return false;
        }
        else return true;
    }
}