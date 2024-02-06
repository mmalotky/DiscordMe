import fs from "fs";
import { readdir } from "fs/promises";
import GroupMeChannel from "../models/GroupMeChannel";
import { WARN } from "../utility/LogMessage";

export default class DataHandler {
    private static DATA_PATH = "./data";

    public static async addConfig(discordID:string, groupMeChannel:GroupMeChannel) {
        if(await this.checkConfig(discordID)) {
            return WARN(`Channel ${discordID} already has a groupme channel assigned`);
        }

        const path = this.getFilePath(discordID, groupMeChannel.getID());
        const folderPath = path.substring(0, path.lastIndexOf("/"));
        fs.mkdirSync(folderPath, {recursive: true});

        const json = JSON.stringify(groupMeChannel);
        fs.writeFile(path, json, (err) => this.handleIOErr(err));
    }

    private static async checkConfig(discordID:string) {
        try {
            const folderPath = `${this.DATA_PATH}/${discordID.substring(0,2)}/${discordID.substring(2)}`;
            const dir = await readdir(folderPath);
            return dir.length > 0;
        }
        catch(err) {
            this.handleIOErr(err);
            return false;
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