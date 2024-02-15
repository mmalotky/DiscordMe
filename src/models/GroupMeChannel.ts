export default class GroupMeChannel {
    private id:string;
    private name:string;
    private lastMessageID:string = "0";

    constructor(id:string, name:string) {
        this.id = id;
        this.name = name;
    }

    getName() {
        return this.name;
    }

    getID() {
        return this.id;
    }

    getLastMessageID() {
        return this.lastMessageID;
    }

    setLastMessageID(value:string) {
        this.lastMessageID = value;
    }
}