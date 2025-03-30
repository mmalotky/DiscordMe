import { GroupMeMessageParseError } from "../errors";

export default class GroupMeImageController {

  /** Fetches the image from a given URL
  *
  * @throws GroupMeMessageParseError
  */
 
  public async getImage(url: string): Promise<Buffer> {
    const response = await fetch(url);  
    if (response.ok) {
    if (response.body) return Buffer.from(await response.arrayBuffer());
    else throw new GroupMeMessageParseError(`No image found at: ${url}`);
    } else throw new GroupMeMessageParseError(`Failed to fetch: ${url}`);
  }
}