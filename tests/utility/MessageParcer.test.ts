import {
  GroupMeAPIMessage,
  parceGroupMeMessage,
} from "../../src/utility/MessageParcer";

const date = new Date();
const groupMeAPImessage: GroupMeAPIMessage = {
  id: "testID",
  user_id: "testUID",
  name: "testName",
  avatar_url: "testURL",
  group_id: "testGID",
  created_at: date.getTime() / 1000,
  text: "",
  system: false,
  attachments: [],
};

test("ShouldParceGroupMeMessage", () => {
  const message = { ...groupMeAPImessage };
  message.text = "Testing, testing, 1 2 3";
  const gmMessage = parceGroupMeMessage(message);

  expect(gmMessage.getCreatedOn().getTime()).toBe(date.getTime());
  expect(gmMessage.getGroupID()).toBe("testGID");
  expect(gmMessage.getIsSystem()).toBe(false);
  expect(gmMessage.getText()).toBe("Testing, testing, 1 2 3");
  expect(gmMessage.getID()).toBe("testID");

  expect(gmMessage.getMember().getAvatarURL()).toBe("testURL");
  expect(gmMessage.getMember().getID()).toBe("testUID");
  expect(gmMessage.getMember().getName()).toBe("testName");
});
