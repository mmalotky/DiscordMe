import * as Net from "../net.js";
import * as Error from "~/errors.js";
import { Group } from "../models/Group.js";

/**
 * Fetches all visible groups from GroupMe
 *
 * @returns A collection of `Group`s
 * @throws Error.net.* - various potential networking and parsing errors.
 */
export async function fetchAll(): Promise<Group[]> {
  const groups: Group[] = [];
  let page: number | undefined = 1;
  while (page) {
    const response = await fetchPage(page);

    if (response.length > 0) {
      groups.push(...response);
      page += 1;
    } else {
      page = undefined;
    }
  }

  return groups;
}

/**
 * Fetches a group from GroupMe given a specific name
 *
 * @param name - name of the group being checked for
 * @returns A `Group`
 * @throws Error.basic.TooMany - naming collision
 * @throws Error.net.NotFound - group with name not found
 * @throws Error.net.* - various potential networking and parsing errors.
 */
export async function fetchByName(name: string): Promise<Group> {
  const groups = (await fetchAll()).filter(
    (channel) => channel.getName() === name,
  );
  if (groups.length > 1) throw new Error.basic.TooMany(name);

  const group = groups.at(0);
  if (!group) throw new Error.net.NotFound(name);

  return group;
}

/**
 * Fetches a group from GroupMe given a specific id
 *
 * @param id - id of the group being checked for
 * @returns A `Group`
 * @throws Error.net.NotFound - group with id not found
 * @throws Error.net.* - various potential networking and parsing errors.
 */
export async function fetchById(id: string): Promise<Group> {
  const group = (await fetchAll()).find((channel) => channel.getID() === id);
  if (!group) throw new Error.net.NotFound(id);

  return group;
}

async function fetchPage(page: number): Promise<Group[]> {
  const request: Net.api.IGroupIndexRequest = {
    endpoint: "groups",
    params: { page: `${page}` },
  };
  const response: Net.api.IGroupIndexResponse =
    await Net.api.fetchJSON(request);
  return response.response.map((group) => {
    return Group.fromApi(group);
  });
}
