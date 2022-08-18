import * as AWS from "aws-sdk";

export const sendTo = async (
  event: any,
  roomId: string,
  connectionId: string,
  data: string
) => {
  const callbackAPI = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint:
      event.requestContext.domainName + "/" + event.requestContext.stage,
  });

  const goneConnectionIds: string[] = [];

  try {
    const response = await callbackAPI
      .postToConnection({
        ConnectionId: connectionId,
        Data: data,
      })
      .promise();

    console.log("callback response: ", response);
  } catch (error: any) {
    if (error.statusCode === 410) {
      goneConnectionIds.push(connectionId);
    }
    return { statusCode: 500 };
  }

  await deleteGoneConnections(goneConnectionIds, roomId);

  return { statusCode: 200 };
};

export const broadcast = async (
  event: any,
  roomId: string,
  cids: string[],
  data: string
) => {
  const callbackAPI = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint:
      event.requestContext.domainName + "/" + event.requestContext.stage,
  });

  const goneConnectionIds: string[] = [];

  const sendMessages = cids.map(async (connectionId) => {
    if (connectionId !== event.requestContext.connectionId) {
      try {
        const response = await callbackAPI
          .postToConnection({
            ConnectionId: connectionId,
            Data: data,
          })
          .promise();

        console.log("callback response: ", response);
      } catch (error: any) {
        console.log(error);
        if (error.statusCode === 410) {
          goneConnectionIds.push(connectionId);
        }
      }
    }
  });

  try {
    await Promise.all(sendMessages);
  } catch (e) {
    console.log(e);
    return {
      statusCode: 500,
    };
  }

  await deleteGoneConnections(goneConnectionIds, roomId);

  return { statusCode: 200 };
};

export const fetchRoomIdFromConnection = async (event: any) => {
  const connectionId = event.requestContext.connectionId;
  const client = new AWS.DynamoDB.DocumentClient();
  const connection = await client
    .get({
      TableName: process.env.KUE_TABLE_NAME!,
      Key: { SK: `Connection#${connectionId}` },
    })
    .promise();

  if (!connection.Item) {
    console.log("connection get failed");
    return {
      statusCode: 500,
    };
  }

  if (!connection.Item) {
    return null;
  }

  return connection.Item.roomId;
};

export const fetchRoomUsers = async (event: any, roomId: string) => {
  const client = new AWS.DynamoDB.DocumentClient();
  const users = await client
    .query({
      TableName: process.env.KUE_TABLE_NAME!,
      KeyConditionExpression: "PK = :pk and begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `Room#${roomId}`,
        ":sk": `User#`,
      },
    })
    .promise();

  if (!users.Items) return [];
  return users.Items;
};

export const fetchRoomUserConnections = async (event: any, roomId: string) => {
  const users = await fetchRoomUsers(event, roomId);
  const client = new AWS.DynamoDB.DocumentClient();

  const userIds = users.map((user) => {
    return user.userId;
  });
  console.log("userIds ", userIds);
  let connectionIds: string[] = [];

  for (const userId of userIds) {
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

    console.log("connections items", connections.Items);

    if (connections.Items && connections.Items.length > 0) {
      const cids = connections.Items.map((c) => {
        return c.connectionId;
      });

      connectionIds = connectionIds.concat(cids);
    }
  }

  return connectionIds;
};

export const deleteGoneConnections = async (
  connectionIds: string[],
  roomId: string
) => {
  const client = new AWS.DynamoDB.DocumentClient();
  await connectionPostProcessing(connectionIds);
};

export const connectionPostProcessing = async (connectionIds: string[]) => {
  const client = new AWS.DynamoDB.DocumentClient();
  const roomId = [];
  for (const connectionId of connectionIds) {
    const params = {
      TableName: process.env.KUE_TABLE_NAME!,
      KeyConditionExpression: "PK = :pk and begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `Connection#${connectionId}`,
        ":sk": `User#`,
      },
    };

    const connectionsResult = await client.query(params).promise();
    const connections = connectionsResult.Items;

    if (!connections || connections.length === 0) {
      console.log("connection not found");
      return {
        roomId: null,
        statusCode: 500,
      };
    }

    console.log("connection items: ", connections);

    const deleteds = [];

    for (const connection of connections) {
      const deletedConnection = await client
        .delete({
          TableName: process.env.KUE_TABLE_NAME!,
          Key: {
            PK: `Connection#${connectionId}`,
            SK: `User#${connection.userId}`,
          },
          ReturnValues: "ALL_OLD",
        })
        .promise();

      if (deletedConnection.Attributes) {
        deleteds.push({
          roomId: deletedConnection.Attributes.roomId,
          userId: deletedConnection.Attributes.userId,
          connectionId: deletedConnection.Attributes.connectionId,
        });

        roomId.push(deletedConnection.Attributes.roomId);
      }
    }

    for (const deleted of deleteds) {
      await client
        .delete({
          TableName: process.env.KUE_TABLE_NAME!,
          Key: {
            PK: `User#${deleted.userId}`,
            SK: `Connection#${deleted.connectionId}`,
          },
        })
        .promise();

      const params = {
        TableName: process.env.KUE_TABLE_NAME!,
        KeyConditionExpression: "PK = :pk and begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `User#${deleted.userId}`,
          ":sk": `Connection#`,
        },
      };

      const userConnections = await client.query(params).promise();
      if (!userConnections.Items || userConnections.Items.length === 0) {
        await client
          .delete({
            TableName: process.env.KUE_TABLE_NAME!,
            Key: { PK: `Room#${deleted.roomId}`, SK: `User#${deleted.userId}` },
            ReturnValues: "ALL_OLD",
          })
          .promise();
      }
    }
  }
  return {
    roomId: roomId[0],
    statusCode: 200,
  };
};
