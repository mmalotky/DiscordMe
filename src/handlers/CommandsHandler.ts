import dotenv from "dotenv";
import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes} from "discord.js";
import Command from "../commands/Command.js";

export default class CommandsHandler {
    private commands:Command[] = [];
    private commandsJSON:RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
    private rest = new REST({version:'10'});

    constructor() {
        dotenv.config();
        


        if(process.env.DISCORD_TOKEN) this.rest.setToken(process.env.DISCORD_TOKEN);
        else console.log("[ERR]: No discord token found");
    }

    getCommands() {
        return this.commands;
    }

    register() {
        try {
            console.log("[INFO] Registering commands...");
    
            if(process.env.CLIENT_ID && process.env.SERVER_ID) {
                this.rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.SERVER_ID),
                    {body: this.commandsJSON}
                )
    
                console.log("[INFO]...Commands Registered");
            }
            else console.log("[ERR] Client/ Server ID's not Found");
        }
        catch(err) {console.log(err)}
    }
}