import * as AWS from "aws-sdk";
import MessageType from "./types/message";
import {
  fetchRoomUsers,
  broadcast,
  fetchRoomUserConnections,
  connectionPostProcessing,
} from "./util";

export async function handler(event: any): Promise<any> {
  console.log(`onDisconnect ${JSON.stringify(event)}`);
  const connectionId = event.requestContext.connectionId;
  const result = await connectionPostProcessing([connectionId]);

  if (!result.roomId) {
    return { statusCode: 500 };
  }

  const roomId = result.roomId;

  const users = await fetchRoomUsers(event, roomId);

  if (!users) {
    console.log("users not found.");
    return { statusCode: 500 };
  }

  const connectionIds = await fetchRoomUserConnections(event, roomId);
  console.log("cids", connectionIds);

  const message: MessageType = {
    action: "onDisconnect",
    value: { users: users },
  };

  const data = JSON.stringify(message);
  const response = await broadcast(event, roomId, connectionIds, data);

  if (response.statusCode != 200) {
    console.log("broadcast failed");
    return {
      statusCode: response.statusCode,
    };
  }

  console.log("success onDisconnect");
  return {
    statusCode: 200,
    body: "onDisconnect.",
  };
}
