import * as AWS from "aws-sdk";
import MessageType from "./types/message";
import { broadcast, fetchRoomUserConnections, fetchRoomUsers } from "./util";

export async function handler(event: any): Promise<any> {
  console.log(`onResetTable ${JSON.stringify(event)}`);
  const client = new AWS.DynamoDB.DocumentClient();
  const requestBody = JSON.parse(event.body);

  const roomId = requestBody.roomId;
  if (!roomId) {
    console.log("request body roomId not found.");
    return { statusCode: 500 };
  }

  const users = await fetchRoomUsers(event, roomId);
  if (!users) {
    console.log("room not found");
    return { statusCode: 500 };
  }

  const params = users.map((u) => {
    return {
      PutRequest: {
        Item: {
          PK: `Room#${roomId}`,
          SK: `User#${u.userId}`,
          roomId: roomId,
          userId: u.userId,
          emoji: u.emoji,
          value: -1,
          isOwner: u.isOwner,
        },
      },
    };
  });

  // 未選択状態のvalueは-1
  await client
    .batchWrite({
      RequestItems: {
        [process.env.KUE_TABLE_NAME!]: params,
      },
    })
    .promise();

  const newUsers = await fetchRoomUsers(event, roomId);
  if (!newUsers) {
    console.log("newUsers not found.");
    return {
      statusCode: 500,
    };
  }

  const connectionIds = await fetchRoomUserConnections(event, roomId);
  const message: MessageType = {
    action: "onResetTable",
    value: { users: newUsers },
  };

  const response = await broadcast(
    event,
    roomId,
    connectionIds,
    JSON.stringify(message)
  );

  if (response.statusCode != 200) {
    console.log("broadcast failed");
    return {
      statusCode: response.statusCode,
    };
  }

  console.log("success onResetTable");
  return {
    statusCode: 200,
    body: "onResetTable.",
  };
}
