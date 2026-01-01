import * as Discord from "~/discord.js";
import * as GroupMe from "~/groupMe.js";
import { Env } from "~/utility.js";

async function main() {
  GroupMe.init();
  await Discord.init();

  if (Env.getOptional(Env.OPTIONAL.CI)) await Discord.Commands.GM.updateNow();
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
