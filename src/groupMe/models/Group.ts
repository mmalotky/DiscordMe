import type { IGroup } from "../net/api/objects.js";
import * as Errors from "~/errors.js";
export class Group {
  /**
   * Model for GroupMe Channel for encoding persistent data
   */

  private id: string;
  private name: string;
  private lastMessageID: string = "0";

  constructor(apiGroup: IGroup) {
    this.id = apiGroup.id;
    this.name = apiGroup.name;
  }

  static fromJson(json: string): Group {
    try {
      return JSON.parse(json) as Group;
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
