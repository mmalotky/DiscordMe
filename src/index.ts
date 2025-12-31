import * as dotenv from "dotenv";
import * as Bot from "./handlers/BotHandler.js";

async function main() {
  dotenv.config();
  await Bot.run();
}

main()
  .catch((err) => {
    console.error(`fatal error:\n\t${err}`);
    process.exit(-1);
  })
  .finally(() => {
    if (process.env.CI) process.exit();
  });
