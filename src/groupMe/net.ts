import * as api from "./net/api.js";

export * as api from "./net/api.js";

let isInit: true | undefined;

export function init() {
  if (isInit) return;
  isInit = true;

  api.init();
}
