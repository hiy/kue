import MessageType from "./types/message";
import { fetchRoomUsers, sendTo } from "./util";

export async function handler(event: any): Promise<any> {
  console.log(`onFetchLatestTable ${JSON.stringify(event)}`);
  const requestBody = JSON.parse(event.body);

  const roomId = requestBody.roomId;
  if (!roomId) {
    console.log("request body roomId not found.");
    return { statusCode: 500 };
  }

  const users = await fetchRoomUsers(event, roomId);
  if (!users) {
    console.log("users not found.");
    return { statusCode: 500 };
  }

  const connectionId = event.requestContext.connectionId;

  const message: MessageType = {
    action: "onFetchLatestTable",
    value: { users: users },
  };

  await sendTo(event, roomId, connectionId, JSON.stringify(message));

  console.log("success onFetchLatestTable");
  return {
    statusCode: 200,
    body: "onFetchLatestTable.",
  };
}
