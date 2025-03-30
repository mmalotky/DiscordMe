import { Stream } from "stream";
import { ERR } from "../utility/LogMessage";

export default class GroupMeImageController {
  public async getImage(url: string): Promise<Stream | null> {
    const response = await fetch(url);

    if (response.ok) {
      if (response.body) {
        return Stream.Duplex.from(response.body);
      } else {
        ERR(`No image found at: ${url}`);
        return null;
      }
    } else {
      ERR(`Failed to fetch: ${url}`);
      return null;
    }
  }
}
