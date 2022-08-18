import * as AWS from "aws-sdk";
import MessageType from "./types/message";
import { fetchRoomUsers, broadcast, fetchRoomUserConnections } from "./util";

const userEmojis = [
  "🦄",
  "🦨",
  "🦦",
  "🐰",
  "🦏",
  "🦣",
  "🦒",
  "🐷",
  "🐯",
  "🦍",
  "🐧",
  "🐸",
  "🐳",
  "🦈",
  "🐙",
  "🐌",
  "🐞",
  "🌹",
  "🌻",
  "🌵",
];

export async function handler(event: any): Promise<any> {
  console.log(`onConnect ${JSON.stringify(event)}`);

  const client = new AWS.DynamoDB.DocumentClient();
  const roomId = event.queryStringParameters.roomId;
  const connectionId = event.requestContext.connectionId;
  const userId = event.queryStringParameters.userId;
  const connectionToken = event.queryStringParameters.connectionToken;
  const originHostname = process.env.KUE_CLIENT_ORIGIN_HOSTNAME;
  console.log("origin: ", originHostname);
  // Check Origin
  if (originHostname !== event.headers.Origin) {
    console.log("Invalid Origin");
    return {
      statusCode: 400,
    };
  }

  const users = await fetchRoomUsers(event, roomId);

  console.log("exist users: ", users);

  const connectUser = users.filter((user) => {
    return user.userId == userId;
  });

  await client
    .put({
      TableName: process.env.KUE_TABLE_NAME!,
      Item: {
        PK: `Connection#${connectionId}`,
        SK: `User#${userId}`,
        connectionId: connectionId,
        connectionToken: connectionToken,
        roomId: roomId,
        userId: userId,
        createdAt: new Date().getTime(),
      },
    })
    .promise();

  await client
    .put({
      TableName: process.env.KUE_TABLE_NAME!,
      Item: {
        PK: `User#${userId}`,
        SK: `Connection#${connectionId}`,
        connectionId: connectionId,
        roomId: roomId,
        userId: userId,
        createdAt: new Date().getTime(),
      },
    })
    .promise();

  // 初めて画面を開いたユーザの場合Userを作成
  if (!connectUser || connectUser.length == 0) {
    const newUser = {
      PK: `Room#${roomId}`,
      SK: `User#${userId}`,
      roomId: roomId,
      userId: userId,
      emoji: notYetSelectedEmoji(users),
      value: -1,
      isOwner: false,
    };

    await client
      .put({ TableName: process.env.KUE_TABLE_NAME!, Item: newUser })
      .promise();
  }

  const newUsers = await fetchRoomUsers(event, roomId);
  const connectionIds = await fetchRoomUserConnections(event, roomId);
  console.log("cids", connectionIds);

  const message: MessageType = {
    action: "onConnect",
    value: { users: newUsers },
  };

  const data = JSON.stringify(message);
  const response = await broadcast(event, roomId, connectionIds, data);

  if (response.statusCode != 200) {
    console.log("broadcast failed");
    return {
      statusCode: 200,
    };
  }

  console.log("success onConnect");
  return {
    statusCode: 200,
    body: "onConnect.",
  };
}

const notYetSelectedEmoji = (users: any) => {
  const selectedEmojis = users.map((user: any) => {
    return user.emoji;
  });

  for (const emoji of userEmojis) {
    if (selectedEmojis.includes(emoji)) continue;
    return emoji;
  }

  return "🌵";
};
