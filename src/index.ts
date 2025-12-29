import * as dotenv from "dotenv";
import * as Bot from "./handlers/BotHandler.js";

function main() {
  dotenv.config();
  Bot.run();
}

main();
