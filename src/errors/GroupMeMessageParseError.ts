export default class GroupMeMessageParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GroupMeMessageParseError";
  }
}
