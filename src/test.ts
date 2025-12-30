import * as dotenv from "dotenv";
import * as Bot from "./handlers/BotHandler.js";

async function main() {
  dotenv.config();
  await Bot.runAndExit();
}

main()
  .catch(() => {})
  .finally(process.exit.bind(process));
