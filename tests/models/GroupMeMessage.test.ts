import * as GroupMe from "../../src/groupMe.js";

const tester = new GroupMe.Member("456", "tester", "avatarurl");

const attachments: GroupMe.Attachment[] = [
  new GroupMe.ImageAttachment(
    "testImage",
    Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]),
  ),
  new GroupMe.EmojiAttachment("@", [
    [1, 2],
    [3, 4],
  ]),
];

const message = new GroupMe.Message(
  "123",
  tester,
  "789",
  new Date(628021800000),
  "Hello, World!",
  attachments,
  false,
);

test("Get ID", () => expect(message.getID()).toMatch(/^123$/));

test("Get Member", () => expect(message.getMember()).toBe(tester));

test("Get GroupID", () => expect(message.getGroupID()).toMatch(/^789$/));

test("Get CreatedOn", () =>
  expect(message.getCreatedOn().getTime()).toBe(628021800000));

test("Get Text", () => expect(message.getText()).toMatch(/^Hello, World!$/));

test("Set Text", () => {
  message.setText("new text");
  expect(message.getText()).toMatch(/^new text$/);
});

test("Get Attachments", () =>
  expect(message.getAttachments()).toEqual(attachments));

test("Set Attachments", () => {
  const newAttachments: GroupMe.Attachment[] = [
    new GroupMe.ImageAttachment(
      "testImage",
      Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]),
    ),
  ];
  message.setAttachments(newAttachments);
  expect(message.getAttachments()).toEqual(newAttachments);
});

test("Get IsSystem", () => expect(message.getIsSystem()).toEqual(false));
