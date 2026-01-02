import { validateIGroup, validateIMessage } from "./ObjectValidator.js";
import * as Response from "./responses.js";
import * as Errors from "~/errors.js";

function throwInvalid() {
  throw new Errors.net.Parse("");
}

function throwMissing(prop: string) {
  throw new Errors.net.Parse(`missing ${prop}`);
}

export function validateIMessageIndexResponse(
  obj: Response.IMessageIndexResponse,
): asserts obj is Response.IMessageIndexResponse {
  if (!("response" in obj)) throwMissing("response");
  if (!("messages" in obj.response)) throwMissing("messages");

  if (!Array.isArray(obj.response.messages)) throwInvalid();
  obj.response.messages.forEach(validateIMessage);
}

export function validateIGroupIndexResponse(
  obj: Response.IGroupIndexResponse,
): asserts obj is Response.IGroupIndexResponse {
  if (!("response" in obj)) throwMissing("response");
  if (!Array.isArray(obj.response)) throwInvalid();
  obj.response.forEach(validateIGroup);
}
