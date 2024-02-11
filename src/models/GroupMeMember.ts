export default class GroupMeMember {
    private id:string;
    private name:string;
    private nickname:string | undefined;
    private avatarURL:string;
    
    constructor(id:string, name:string, avatarURL:string, nickname?:string) {
        this.id = id;
        this.name = name;
        this.nickname = nickname;
        this.avatarURL = avatarURL;
    }

    getID() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getNickname() {
        return this.nickname;
    }

    getAvatarURL() {
        return this.avatarURL;
    }
}