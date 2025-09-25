import { GroupMeMessageParseError } from "../errors";
import GroupMeMessageFetchError from "../errors/GroupMeMessageFetchError";
import { emojify } from "node-emoji";

export default class GroupMeEmojiMeta {
    constructor() {
        this.getMeta();
    }

    async getMeta() {
        const response: Response = await fetch("https://powerup.groupme.com/powerups");
        if (response.status !== 200)
            throw new GroupMeMessageFetchError(`STATUS: ${response.status}`);

        const json:GroupMeAPIEmojiMeta = await response.json();

        for (const set of json.powerups) {
            const emojiSet:string[] = [];
            for(const meta of set.meta.transliterations) {
                const emojiTranscription = this.formatEmoji(meta);
                const emoji = emojify(emojiTranscription);
                console.log(emoji)
                emojiSet.push(emoji);
            }

            this.emojiMap.push(emojiSet);
        }
    }

    private formatEmoji(meta:string) {
        return ":" + meta.replace(" ", "_") + ":";
    }

    private emojiMap:string[][] = [[]];

    public getEmoji(index:number, pick:number):string {
        if (this.emojiMap.length < index + 1)
            throw new GroupMeMessageParseError(`Failed to parse emoji from the metadata: no map data at index [${index},${pick}]`);

        if (this.emojiMap[index].length < pick + 1)
            throw new GroupMeMessageParseError(`Failed to parse emoji from the metadata: no map data at pick [${index},${pick}]`);


        return this.emojiMap[index][pick];
    }
}

type GroupMeAPIEmojiMeta = {
    powerups:GroupMeAPIEmojiMetaPack[];
}

type GroupMeAPIEmojiMetaPack = {
    id:string;
    name:string;
    description:string;
    type:string;
    created_at:number;
    updated_at:number;
    meta:GroupMeAPIEmojiMetaPackMeta;
}

type GroupMeAPIEmojiMetaPackMeta = {
    pack_id:number;
    transliterations:string[];
}