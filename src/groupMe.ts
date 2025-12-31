export * from "./groupMe/handlers.js";
export * from "./groupMe/models.js";

import * as Net from "./groupMe/net.js";

let isInit: true | undefined;

export function init() {
  if (isInit) return;
  isInit = true;

  Net.init();
}
