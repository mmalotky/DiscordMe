export default class GroupMeMessageFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GroupMeMessageFetchError";
  }
}
