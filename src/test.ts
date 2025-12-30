import * as dotenv from "dotenv";
import * as Bot from "./handlers/BotHandler.js";

async function main() {
  console.log(process.env);
  console.log(`TESTING: ${process.env.BEEP}`);
  console.log(`TESTING: asdfghjkl`);
  dotenv.config();
  await Bot.runAndExit();
  console.log("234r5yuh7");
}

main()
  .catch(() => {})
  .finally(() => {
    console.log("fejkdrgbhkdrgdrgkbdrgdrg");
    process.exit();
  });
