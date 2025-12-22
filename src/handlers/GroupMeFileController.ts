import { GroupMeMessageParseError } from "../errors";

export default class GroupMeFileController {
  /** Fetches the image from a given URL
   *
   * @throws GroupMeMessageParseError
   */

  public async getFile(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (response.ok) {
      if (response.body) return Buffer.from(await response.arrayBuffer());
      else throw new GroupMeMessageParseError(`No File found at: ${url}`);
    } else throw new GroupMeMessageParseError(`Failed to fetch: ${url}`);
  }

  public async getFileName(url: string): Promise<string> {
    const response = await fetch(url);
    if (response.ok) {
      const contentDisposition = response.headers.get("content-disposition");
      if (contentDisposition) {
        const regEx: RegExp = /(?<='').*$/;
        const searchName = regEx.exec(contentDisposition);
        if (searchName) return searchName[0];
        else
          throw new GroupMeMessageParseError(
            `No File name found in : ${contentDisposition}`,
          );
      } else
        throw new GroupMeMessageParseError(`No File name found at: ${url}`);
    } else throw new GroupMeMessageParseError(`Failed to fetch: ${url}`);
  }
}
