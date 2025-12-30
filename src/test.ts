import * as dotenv from "dotenv";
import * as Bot from "./handlers/BotHandler.js";

async function main() {
  dotenv.config();
  console.log(`TESTING: ${process.env.TEST_GROUPME_GROUP_NAME}`);
  await Bot.runAndExit();
  console.log("234r5yuh7");
}

main()
  .catch(() => {})
  .finally(() => {
    console.log("fejkdrgbhkdrgdrgkbdrgdrg");
    process.exit();
  });
