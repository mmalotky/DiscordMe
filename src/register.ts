import * as Discord from "~/discord.js";
import * as GroupMe from "~/groupMe.js";
import { Env } from "~/utility.js";

async function main() {
  GroupMe.init();
  await Discord.init();
  await Discord.registerCommands();
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
    process.exit();
  });
