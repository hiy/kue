import * as AWS from "aws-sdk";
import MessageType from "./types/message";
import { broadcast, fetchRoomUserConnections, fetchRoomUsers } from "./util";

export async function handler(event: any): Promise<any> {
  console.log(`onUpdateTable ${JSON.stringify(event)}`);
  const client = new AWS.DynamoDB.DocumentClient();
  const requestBody = JSON.parse(event.body);

  const roomId = requestBody.roomId;
  if (!roomId) {
    console.log("request body roomId not found.");
    return { statusCode: 500 };
  }

  const newUser = requestBody.user;
  if (!newUser) {
    console.log("request body user not found.");
    return { statusCode: 500 };
  }

  // 新しいユーザ情報でテーブルを書き換える
  const result = await client
    .update({
      TableName: process.env.KUE_TABLE_NAME!,
      Key: { PK: `Room#${roomId}`, SK: `User#${newUser.userId}` },
      ExpressionAttributeNames: {
        "#u": "value",
      },
      ExpressionAttributeValues: {
        ":v": newUser.value,
      },
      UpdateExpression: `SET #u = :v`,
      ReturnValues: "ALL_NEW",
    })
    .promise();

  if (!result.Attributes) {
    console.log("update failed");
    return {
      statusCode: 500,
    };
  }

  const connectionIds = await fetchRoomUserConnections(event, roomId);
  const newUsers = await fetchRoomUsers(event, roomId);
  const message: MessageType = {
    action: "onUpdateTable",
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

  console.log("success onUpdateTable");
  return {
    statusCode: 200,
    body: "onUpdateTable.",
  };
}
