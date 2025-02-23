export default class GroupMeMember {
    /**
     * GroupMe member model
     */

    private id:string;
    private name:string;
    private avatarURL:string;
    
    constructor(id:string, name:string, avatarURL:string) {
        this.id = id;
        this.name = name;
        this.avatarURL = avatarURL;
    }

    getID() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getAvatarURL() {
        return this.avatarURL;
    }
}