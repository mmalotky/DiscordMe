export * as Commands from "./discord/commands.js";
export * from "./discord/utility.js";

import * as ClientHandler from "./discord/handlers/ClientHandler.js";

let isInit: true | undefined;

export async function init() {
  if (isInit) return;
  isInit = true;

  await ClientHandler.init();
}
