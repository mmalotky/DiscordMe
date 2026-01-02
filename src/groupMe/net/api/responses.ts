import * as Obj from "./objects.js";

export interface IGroupIndexResponse {
  response: Obj.IGroup[];
}

export interface IMessageIndexResponse {
  response: {
    messages: Obj.IMessage[];
  };
}
