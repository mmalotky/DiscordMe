import type * as Requests from "./api/requests.js";
import { Env } from "~/utility.js";
import * as Errors from "~/errors.js";

export * from "./api/objects.js";
export * from "./api/requests.js";
export * from "./api/responses.js";
export * from "./api/ResponseValidator.js";

const GROUPME_URL_PREFIX: string = "https://api.groupme.com/v3";

let isInit: true | undefined;

export function init() {
  if (isInit) return;
  isInit = true;

  Env.init();
}

export function assertInit() {
  if (!isInit)
    throw new Errors.basic.Fatal(
      "Attempted to use the GroupMe API before initialization.",
    );
}

function formatUrl(request: Requests.IRequest): string {
  assertInit();
  const token = Env.getRequired(Env.REQUIRED.GROUPME_TOKEN);
  let url = `${GROUPME_URL_PREFIX}/${request.endpoint}?token=${token}`;
  Object.entries(request.params).forEach(([key, value]) => {
    url += `&${key}=${value}`;
  });

  return url;
}

function throwCommonErrorsForResponseFromUrl(response: Response, url: string) {
  // https://dev.groupme.com/docs/responses
  if (response.ok) return;
  else if (response.status == 401) throw new Errors.net.Unauthorized(url);
  else if (response.status == 403) throw new Errors.net.Forbidden(url);
  else if (response.status == 404) throw new Errors.net.NotFound(url);
  else if (response.status == 420) throw new Errors.net.RateLimited(url);
  else if (response.status == 500)
    throw new Errors.net.Connection(
      `${url} - internal server error. Unknown cause.`,
    );
  else if (response.status == 502)
    throw new Errors.net.Connection(
      `${url} - Bad Gateway. GroupMe unavailable. Try again later.`,
    );
  else if (response.status == 503)
    throw new Errors.net.Connection(
      `${url} - Service unavailable. GroupMe overloaded. Try again later.`,
    );
  else throw new Errors.basic.Uncaught(`Unexpected response from ${url}`);
}

export async function fetchJSON<R>(request: Requests.IRequest): Promise<R> {
  assertInit();

  const url = formatUrl(request);

  let response: Response;

  try {
    response = await fetch(url);
  } catch {
    throw new Errors.net.Connection(`Failed to connect to ${url}`);
  }

  throwCommonErrorsForResponseFromUrl(response, url);

  try {
    return (await response.json()) as R;
  } catch {
    throw new Errors.net.Parse(url);
  }
}
