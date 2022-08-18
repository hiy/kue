import * as AWS from "aws-sdk";

export async function handler(event: any): Promise<any> {
  console.log(`onDisconnectZombieConnections ${JSON.stringify(event)}`);
  const requestBody = JSON.parse(event.body);
  const client = new AWS.DynamoDB.DocumentClient();
  const callbackAPI = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint:
      event.requestContext.domainName + "/" + event.requestContext.stage,
  });

  const roomId = requestBody.roomId;
  if (!roomId) {
    console.log("request body roomId not found.");
    return { statusCode: 500 };
  }

  const userId = requestBody.userId;
  if (!userId) {
    console.log("request body userId not found.");
    return { statusCode: 500 };
  }

  const connections = await client
    .query({
      TableName: process.env.KUE_TABLE_NAME!,
      KeyConditionExpression: "PK = :pk and begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `User#${userId}`,
        ":sk": `Connection#`,
      },
    })
    .promise();

  const tokens = requestBody.connectionTokens;

  if (connections.Items && connections.Items.length > 0) {
    for (const connection of connections.Items) {
      if (tokens.includes(connection.connectionToken)) {
        await client.delete({
          TableName: process.env.KUE_TABLE_NAME!,
          Key: {
            PK: `User#${userId}`,
            SK: `Connection#${connection.connectionId}`,
          },
        }).promise;

        await client.delete({
          TableName: process.env.KUE_TABLE_NAME!,
          Key: {
            PK: `Connection#${connection.connectionId}`,
            SK: `User#${userId}`,
          },
        }).promise;

        await callbackAPI.deleteConnection({
          ConnectionId: connection.connectionId,
        });
      }
    }
  }

  console.log("success onDisconnectZombieConnections");
  return {
    statusCode: 200,
    body: "onDisconnectZombieConnections.",
  };
}
