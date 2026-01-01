import * as Bot from "~/handlers/BotHandler.js";
import { Env } from "~/utility.js";

async function main() {
  await Bot.run();
}

main()
  .catch((err) => {
    if (err instanceof Error) {
      console.error(`${err.stack}`);
    } else {
      console.error(`${err}`);
    }
    process.exit(-1);
  })
  .finally(() => {
    Env.init();
    if (Env.getOptional(Env.OPTIONAL.CI)) process.exit();
  });
