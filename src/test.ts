import * as dotenv from "dotenv";
import * as Bot from "./handlers/BotHandler.js";

function main() {
  dotenv.config();
  console.info(process.env);
  Bot.runAndExit();
}

main();
