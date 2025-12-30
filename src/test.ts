import * as dotenv from "dotenv";
import * as Bot from "./handlers/BotHandler.js";

async function main() {
  dotenv.config();
  console.log("sregbbykturyefvgdb");
  await Bot.runAndExit();
}

main()
  .catch(() => {})
  .finally(() => {
    console.log("fejkdrgbhkdrgdrgkbdrgdrg");
    process.exit();
  });
