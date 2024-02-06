import fs from "fs";
import { readdir, readFile, rm } from "fs/promises";
import GroupMeChannel from "../models/GroupMeChannel";
import { ERR, WARN } from "../utility/LogMessage";

export default class DataHandler {
    private static DATA_PATH = "./data";

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

    public static async setConfig(discordID:string, groupMeChannel:GroupMeChannel) {
        if(!await this.checkConfig(discordID)) {
            WARN(`No config exists for channel ${discordID}`);
            return false;
        }
        const result = await this.rmConfig(discordID);
        if(!result) {
            ERR("Failed to remove old configuration");
            return false;
        }
        const path = this.getFilePath(discordID, groupMeChannel.getID());
        this.addConfig(discordID, groupMeChannel);
        return true;
    }

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
        };
    }

    public static async getConfig(discordID:string) {
        try {
            const path = await this.checkConfig(discordID);
            if(!path) return;
            const data = await readFile(path, {encoding:"utf-8"});
            const channel:GroupMeChannel = JSON.parse(data);
            return channel;
        }
        catch(err) {
            this.handleIOErr(err);
        }
    }

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
    
    private static getFilePath(discordID:string, groupmeID:string) {
        return `${this.DATA_PATH}/${discordID.substring(0,2)}/${discordID.substring(2)}/${groupmeID}.json`;
    }

    private static handleIOErr(err: NodeJS.ErrnoException | null) {
        if(err) {
            WARN(err.message);
            return false;
        }
        else return true;
    }
}