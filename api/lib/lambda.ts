import {
  Duration,
  aws_dynamodb as dynamodb,
  aws_lambda as lambda,
} from "aws-cdk-lib";
import { Construct } from "constructs";

export function createFilterReceiver(
  scope: Construct,
  errorNotificationSlackUrl: string
): lambda.Function {
  const filterReceiverLambda = new lambda.Function(
    scope,
    "kue-web-socket-filter-receiver",
    {
      code: new lambda.AssetCode("lib/handler"),
      handler: "KueWebSocket/filterReceiver.handler",
      runtime: lambda.Runtime.NODEJS_16_X,
      timeout: Duration.seconds(10),
      environment: {
        SLACK_URL: errorNotificationSlackUrl,
      },
    }
  );

  return filterReceiverLambda;
}

export function createWebSocketConnectLambda(
  scope: Construct,
  kueTable: dynamodb.Table,
  clientOriginHostname: string
): lambda.Function {
  const connectLambda = new lambda.Function(scope, "kue-web-socket-connect", {
    code: new lambda.AssetCode("lib/handler"),
    handler: "KueWebSocket/connect.handler",
    runtime: lambda.Runtime.NODEJS_16_X,
    timeout: Duration.seconds(10),
    environment: {
      KUE_TABLE_NAME: kueTable.tableName,
      KUE_TABLE_KEY: "PK",
      KUE_CLIENT_ORIGIN_HOSTNAME: clientOriginHostname,
    },
  });

  kueTable.grantReadWriteData(connectLambda);

  return connectLambda;
}

export function createWebSocketDisconnectLambda(
  scope: Construct,
  kueTable: dynamodb.Table
): lambda.Function {
  const disconnectLambda = new lambda.Function(
    scope,
    "kue-web-socket-ondisconnect",
    {
      code: new lambda.AssetCode("lib/handler"),
      handler: "KueWebSocket/disconnect.handler",
      runtime: lambda.Runtime.NODEJS_16_X,
      timeout: Duration.seconds(10),
      environment: {
        KUE_TABLE_NAME: kueTable.tableName,
        KUE_TABLE_KEY: "PK",
      },
    }
  );

  kueTable.grantReadWriteData(disconnectLambda);

  return disconnectLambda;
}

export function createWebSocketDefaultLambda(
  scope: Construct,
  kueTable: dynamodb.Table
): lambda.Function {
  const defaultLambda = new lambda.Function(scope, "kue-web-socket-default", {
    code: new lambda.AssetCode("lib/handler"),
    handler: "KueWebSocket/default.handler",
    runtime: lambda.Runtime.NODEJS_16_X,
    timeout: Duration.seconds(10),
    environment: {
      KUE_TABLE_NAME: kueTable.tableName,
      KUE_TABLE_KEY: "PK",
    },
  });

  kueTable.grantReadWriteData(defaultLambda);

  return defaultLambda;
}

export function createWebSocketResetTableLambda(
  scope: Construct,
  kueTable: dynamodb.Table
): lambda.Function {
  const resetTableLambda = new lambda.Function(
    scope,
    "kue-web-socket-reset-table",
    {
      code: new lambda.AssetCode("lib/handler"),
      handler: "KueWebSocket/resetTable.handler",
      runtime: lambda.Runtime.NODEJS_16_X,
      timeout: Duration.seconds(10),
      environment: {
        KUE_TABLE_NAME: kueTable.tableName,
        KUE_TABLE_KEY: "PK",
      },
    }
  );

  kueTable.grantReadWriteData(resetTableLambda);

  return resetTableLambda;
}

export function createWebSocketUpdateTableLambda(
  scope: Construct,
  kueTable: dynamodb.Table
): lambda.Function {
  const updateTableLambda = new lambda.Function(
    scope,
    "kue-web-socket-update-table",
    {
      code: new lambda.AssetCode("lib/handler"),
      handler: "KueWebSocket/updateTable.handler",
      runtime: lambda.Runtime.NODEJS_16_X,
      timeout: Duration.seconds(10),
      environment: {
        KUE_TABLE_NAME: kueTable.tableName,
        KUE_TABLE_KEY: "PK",
      },
    }
  );

  kueTable.grantReadWriteData(updateTableLambda);

  return updateTableLambda;
}

export function createWebSocketFetchLatestTableLambda(
  scope: Construct,
  kueTable: dynamodb.Table
): lambda.Function {
  const fetchLatestTableLambda = new lambda.Function(
    scope,
    "kue-web-socket-fetch-latest-table",
    {
      code: new lambda.AssetCode("lib/handler"),
      handler: "KueWebSocket/fetchLatestTable.handler",
      runtime: lambda.Runtime.NODEJS_16_X,
      timeout: Duration.seconds(10),
      environment: {
        KUE_TABLE_NAME: kueTable.tableName,
        KUE_TABLE_KEY: "PK",
      },
    }
  );

  kueTable.grantReadWriteData(fetchLatestTableLambda);

  return fetchLatestTableLambda;
}

export function createWebSocketDisconnectZombieConnectionsLambda(
  scope: Construct,
  kueTable: dynamodb.Table
): lambda.Function {
  const disconnectZombieConnectionsLambda = new lambda.Function(
    scope,
    "kue-web-socket-disconnect-zombie-connections",
    {
      code: new lambda.AssetCode("lib/handler"),
      handler: "KueWebSocket/disconnectZombieConnections.handler",
      runtime: lambda.Runtime.NODEJS_16_X,
      timeout: Duration.seconds(10),
      environment: {
        KUE_TABLE_NAME: kueTable.tableName,
        KUE_TABLE_KEY: "PK",
      },
    }
  );

  kueTable.grantReadWriteData(disconnectZombieConnectionsLambda);

  return disconnectZombieConnectionsLambda;
}
