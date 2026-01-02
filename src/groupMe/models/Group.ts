import type { IGroup } from "../net/api/objects.js";
import * as Errors from "~/errors.js";

interface IConfigGroup {
  id: string;
  name: string;
  lastMessageID: string;
}

export class Group {
  /**
   * Model for GroupMe Channel for encoding persistent data
   */

  private id: string;
  private name: string;
  private lastMessageID: string = "0";

  private constructor() {
    this.id = "uninitialized";
    this.name = "uninitialized";
  }

  static fromApi(apiGroup: IGroup) {
    const group = new Group();
    group.id = apiGroup.id;
    group.name = apiGroup.name;
    return group;
  }

  static fromJson(json: string): Group {
    try {
      return Object.assign(new Group(), JSON.parse(json) as IConfigGroup);
    } catch (err) {
      Errors.assertValid(err);
      throw new Errors.basic.Configuration(
        `Error converting Group to JSON: ${err.message}`,
      );
    }
  }

  getName() {
    return this.name;
  }

  getID() {
    return this.id;
  }

  getLastMessageID() {
    return this.lastMessageID;
  }

  setLastMessageID(value: string) {
    this.lastMessageID = value;
  }
}
