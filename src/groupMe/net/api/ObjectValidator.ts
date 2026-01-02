import * as Obj from "./objects.js";
import * as Errors from "~/errors.js";

function throwInvalid() {
  throw new Errors.net.Parse("");
}

function throwMissing(prop: string) {
  throw new Errors.net.Parse(`missing ${prop}`);
}

export function validateIMessage(
  obj: Obj.IMessage,
): asserts obj is Obj.IMessage {
  [
    "id",
    "user_id",
    "name",
    "avatar_url",
    "group_id",
    "created_at",
    "text",
    "system",
    "attachments",
  ].forEach((prop) => {
    if (!(prop in obj)) throwMissing(prop);
  });

  if (!Array.isArray(obj.attachments)) throwInvalid();
  obj.attachments.forEach(validateIAttachment);
}

function validateIAttachment(
  obj: Obj.IAttachment,
): asserts obj is Obj.IAttachment {
  ["type"].forEach((prop) => {
    if (!(prop in obj)) throwMissing(prop);
  });

  if (obj.charmap) validateDoubleArray(obj.charmap);
  if (obj.loci) validateDoubleArray(obj.loci);
}

function validateDoubleArray(obj: unknown[][]): asserts obj is unknown[][] {
  if (!Array.isArray(obj)) throwInvalid();
  obj.forEach((o) => {
    if (!Array.isArray(o)) throwInvalid();
  });
}

export function validateIGroup(obj: Obj.IGroup): asserts obj is Obj.IGroup {
  ["id", "name", "messages"].forEach((prop) => {
    if (!(prop in obj)) throwMissing(prop);
  });

  if (!("last_message_id" in obj.messages)) throwMissing("last_message_id");
}
