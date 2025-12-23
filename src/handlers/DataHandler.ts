import fs, { readdirSync, readFileSync, rmSync } from "fs";
import GroupMeChannel from "~/models/GroupMeChannel.js";
import { WARN, ERR } from "~/utility/LogMessage.js";

/** Handles persistent data storage */
const DATA_PATH = "data";

/**
 * stores configurations between Discord and GroupMe channels by creating a new
 * file labeled put under a folder for the DiscordID, named by the GroupMe Channel
 * ID. Does not update existing configurations.
 *
 * @param discordID - Discord channel ID
 * @param groupMeChannel - GroupMe Channel Model
 */
export function addConfig(discordID: string, groupMeChannel: GroupMeChannel) {
  if (checkConfig(discordID)) {
    WARN(`Channel ${discordID} already has a GroupMe channel assigned`);
    return false;
  }

  const path = getFilePath(discordID, groupMeChannel.getID());
  const folderPath = path.substring(0, path.lastIndexOf("/"));
  fs.mkdirSync(folderPath, { recursive: true });

  try {
    fs.writeFileSync(path, JSON.stringify(groupMeChannel));
  } catch (err) {
    ERR(err);
  }

  return true;
}

/**
 * Updates an existing configuration data between a groupMe and Discord Channel
 *
 * @param discordID - Discord Channel ID
 * @param groupMeChannel - GroupMe Channel Model
 */
export function setConfig(discordID: string, groupMeChannel: GroupMeChannel) {
  if (!checkConfig(discordID)) {
    WARN(`No config exists for channel ${discordID}`);
    return false;
  }
  const path = getFilePath(discordID, groupMeChannel.getID());
  try {
    fs.writeFileSync(path, JSON.stringify(groupMeChannel));
  } catch (err) {
    ERR(err);
  }
  return true;
}

/**
 * Removes an existing configuration for a Discord Channel
 *
 * @param discordID - Discord Channel ID
 */
export function rmConfig(discordID: string) {
  try {
    const path = checkConfig(discordID);
    if (!path) return false;
    rmSync(path);
    return true;
  } catch (err) {
    WARN(err);
    return false;
  }
}

/**
 * Gets the GroupMe Channel configured to a Discord Channel
 *
 * @param discordID - Discord channel ID
 * @returns null or GroupMe Channel Model
 */
export function getConfig(discordID: string) {
  try {
    const path = checkConfig(discordID);
    if (!path) return;
    const data = readFileSync(path, { encoding: "utf-8" });
    const json = JSON.parse(data) as {
      id: string;
      name: string;
      lastMessageID: string;
    };
    const channel = new GroupMeChannel(json.id, json.name);
    channel.setLastMessageID(json.lastMessageID);
    return channel;
  } catch (err) {
    WARN(err);
  }
}

/** Utility Function to Check if the Discord channel has a configuration */
function checkConfig(discordID: string) {
  try {
    const folderPath = `${DATA_PATH}/${discordID.substring(0, 2)}/${discordID.substring(2)}`;
    const dir = readdirSync(folderPath);
    return dir[0] ? `${folderPath}/${dir[0]}` : undefined;
  } catch (err) {
    WARN(err);
  }
}

/** Utility function to get the filepath format for a given Discord ID and GroupMe ID */
function getFilePath(discordID: string, groupmeID: string) {
  return `${DATA_PATH}/${discordID.substring(0, 2)}/${discordID.substring(2)}/${groupmeID}.json`;
}
