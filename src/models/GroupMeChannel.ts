export default class GroupMeChannel {
    private id:string;
    private name:string;

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
}