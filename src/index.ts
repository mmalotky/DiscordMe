import * as dotenv from "dotenv";
import * as Bot from "./handlers/BotHandler.js";
import { ERR } from "./utility/LogMessage.js";

async function main() {
  dotenv.config();
  await Bot.run();
}

main()
  .catch((e) => {
    ERR(`Fatal exception:\n\t${e}`);
    process.exit(-1);
  })
  .finally(() => {
    if (process.env.CI) process.exit();
  });
