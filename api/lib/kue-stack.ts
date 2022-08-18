import {
  Stack,
  StackProps,
  RemovalPolicy,
  CfnOutput,
  aws_dynamodb as dynamodb,
  aws_apigatewayv2 as apigatewayv2,
  aws_iam as iam,
  aws_logs as logs,
  aws_logs_destinations as destinations,
} from "aws-cdk-lib";
import { Construct } from "constructs";

import {
  createWebSocketConnectLambda,
  createWebSocketDisconnectLambda,
  createWebSocketDefaultLambda,
  createWebSocketResetTableLambda,
  createWebSocketUpdateTableLambda,
  createWebSocketFetchLatestTableLambda,
  createWebSocketDisconnectZombieConnectionsLambda,
  createFilterReceiver,
} from "./lambda";

export class KueStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const region = "ap-northeast-1";
    const name = "kue-web-socket-api";

    const stageName = scope.node.tryGetContext("target") as string;
    let errorNotificationSlackUrl: string = "";
    let clientOriginHostname: string = "";
    require("dotenv").config();

    if (stageName === "prod") {
      errorNotificationSlackUrl =
        process.env.PRODUCTION_ERROR_NOTIFICATION_SLACK_URL ?? "";
      clientOriginHostname =
        process.env.PRODUCTION_CLIENT_ORIGIN_HOSTNAME ?? "";
    } else {
      errorNotificationSlackUrl =
        process.env.DEVELOPMENT_ERROR_NOTIFICATION_SLACK_URL ?? "";
      clientOriginHostname =
        process.env.DEVELOPMENT_CLIENT_ORIGIN_HOSTNAME ?? "";
    }

    // ----- create Dynamodb table ------
    const kueTable = new dynamodb.Table(this, "KueTable", {
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 15,
      writeCapacity: 15,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      tableName: "kue",
      pointInTimeRecovery: false,
    });

    kueTable.addGlobalSecondaryIndex({
      indexName: "GSI1",
      partitionKey: { name: "SK", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "PK", type: dynamodb.AttributeType.STRING },
    });
    // ----- create Dynamodb table ------

    // ----- create Websocket API ------
    const api = new apigatewayv2.CfnApi(this, name, {
      name: "KueWebSocketApi",
      protocolType: "WEBSOCKET",
      routeSelectionExpression: "$request.body.action",
    });
    // ----- create Websocket API ------

    // ----- create lambda functions ------

    // エラーをslack通知
    const filterReceiver = createFilterReceiver(
      this,
      errorNotificationSlackUrl
    );

    // $connectのLambda
    const connectLambda = createWebSocketConnectLambda(
      this,
      kueTable,
      clientOriginHostname
    );

    connectLambda.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [`arn:aws:execute-api:*:*:${api.ref}/${stageName}/*/*`],
        actions: ["execute-api:ManageConnections"],
      })
    );

    const connectionLambdaLogGroup = logs.LogGroup.fromLogGroupName(
      this,
      "connectionLambdaLogGroup",
      connectLambda.logGroup.logGroupName
    );
    connectionLambdaLogGroup.addSubscriptionFilter("Subscription", {
      destination: new destinations.LambdaDestination(filterReceiver),
      filterPattern: logs.FilterPattern.anyTerm("ERROR"),
    });

    // $disconnectのLambda
    const disconnectLambda = createWebSocketDisconnectLambda(this, kueTable);

    disconnectLambda.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [`arn:aws:execute-api:*:*:${api.ref}/${stageName}/*/*`],
        actions: ["execute-api:ManageConnections"],
      })
    );

    const disconnectionLambdaLogGroup = logs.LogGroup.fromLogGroupName(
      this,
      "disconnectionLambdaLogGroup",
      disconnectLambda.logGroup.logGroupName
    );
    disconnectionLambdaLogGroup.addSubscriptionFilter("Subscription", {
      destination: new destinations.LambdaDestination(filterReceiver),
      filterPattern: logs.FilterPattern.anyTerm("ERROR"),
    });

    // $resetTableのLambda
    const resetTableLambda = createWebSocketResetTableLambda(this, kueTable);

    resetTableLambda.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [`arn:aws:execute-api:*:*:${api.ref}/${stageName}/*/*`],
        actions: ["execute-api:ManageConnections"],
      })
    );

    const resetTableLambdaLogGroup = logs.LogGroup.fromLogGroupName(
      this,
      "resetTableLambdaLogGroup",
      resetTableLambda.logGroup.logGroupName
    );
    resetTableLambdaLogGroup.addSubscriptionFilter("Subscription", {
      destination: new destinations.LambdaDestination(filterReceiver),
      filterPattern: logs.FilterPattern.anyTerm("ERROR"),
    });

    // $updateTableのLambda
    const updateTableLambda = createWebSocketUpdateTableLambda(this, kueTable);

    updateTableLambda.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [`arn:aws:execute-api:*:*:${api.ref}/${stageName}/*/*`],
        actions: ["execute-api:ManageConnections"],
      })
    );

    const updateTableLambdaLogGroup = logs.LogGroup.fromLogGroupName(
      this,
      "updateTableLambdaLogGroup",
      updateTableLambda.logGroup.logGroupName
    );
    updateTableLambdaLogGroup.addSubscriptionFilter("Subscription", {
      destination: new destinations.LambdaDestination(filterReceiver),
      filterPattern: logs.FilterPattern.anyTerm("ERROR"),
    });

    // $fetchLatestTableのLambda
    const fetchLatestTableLambda = createWebSocketFetchLatestTableLambda(
      this,
      kueTable
    );

    fetchLatestTableLambda.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [`arn:aws:execute-api:*:*:${api.ref}/${stageName}/*/*`],
        actions: ["execute-api:ManageConnections"],
      })
    );

    const fetchLatestTableLambdaLogGroup = logs.LogGroup.fromLogGroupName(
      this,
      "fetchLatestTableLambdaLogGroup",
      fetchLatestTableLambda.logGroup.logGroupName
    );
    fetchLatestTableLambdaLogGroup.addSubscriptionFilter("Subscription", {
      destination: new destinations.LambdaDestination(filterReceiver),
      filterPattern: logs.FilterPattern.anyTerm("ERROR"),
    });

    // $disconnectZombieConnectionsのLambda
    const disconnectZombieConnectionsLambda =
      createWebSocketDisconnectZombieConnectionsLambda(this, kueTable);

    disconnectZombieConnectionsLambda.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [`arn:aws:execute-api:*:*:${api.ref}/${stageName}/*/*`],
        actions: ["execute-api:ManageConnections"],
      })
    );

    const disconnectZombieConnectionsLambdaLogGroup =
      logs.LogGroup.fromLogGroupName(
        this,
        "disconnectZombieConnectionsLambdaLogGroup",
        disconnectZombieConnectionsLambda.logGroup.logGroupName
      );
    disconnectZombieConnectionsLambdaLogGroup.addSubscriptionFilter(
      "Subscription",
      {
        destination: new destinations.LambdaDestination(filterReceiver),
        filterPattern: logs.FilterPattern.anyTerm("ERROR"),
      }
    );

    // $defaultのLambda
    const defaultLambda = createWebSocketDefaultLambda(this, kueTable);

    defaultLambda.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [`arn:aws:execute-api:*:*:${api.ref}/${stageName}/*/*`],
        actions: ["execute-api:ManageConnections"],
      })
    );

    const defaultLambdaLogGroup = logs.LogGroup.fromLogGroupName(
      this,
      "defaultLambdaLogGroup",
      defaultLambda.logGroup.logGroupName
    );
    defaultLambdaLogGroup.addSubscriptionFilter("Subscription", {
      destination: new destinations.LambdaDestination(filterReceiver),
      filterPattern: logs.FilterPattern.anyTerm("ERROR"),
    });

    const policy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: [
        connectLambda.functionArn,
        disconnectLambda.functionArn,
        resetTableLambda.functionArn,
        updateTableLambda.functionArn,
        fetchLatestTableLambda.functionArn,
        disconnectZombieConnectionsLambda.functionArn,
        defaultLambda.functionArn,
      ],
      actions: ["lambda:InvokeFunction"],
    });

    const role = new iam.Role(this, `${name}-iam-role`, {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });
    role.addToPolicy(policy);

    // $connectルート
    const connectRoute = createRoute(
      this,
      "connect",
      "$connect",
      api,
      role,
      `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${connectLambda.functionArn}/invocations`
    );

    // $disconnectルート
    const disconnectRoute = createRoute(
      this,
      "disconnect",
      "$disconnect",
      api,
      role,
      `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${disconnectLambda.functionArn}/invocations`
    );

    // $defaultルート
    const defaultRoute = createRoute(
      this,
      "default",
      "$default",
      api,
      role,
      `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${defaultLambda.functionArn}/invocations`
    );

    // resetTableルート
    const resetTableRoute = createRoute(
      this,
      "resetTable",
      "resetTable",
      api,
      role,
      `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${resetTableLambda.functionArn}/invocations`
    );

    // updateTableルート
    const updateTableRoute = createRoute(
      this,
      "updateTable",
      "updateTable",
      api,
      role,
      `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${updateTableLambda.functionArn}/invocations`
    );

    // fetchLatestTableルート
    const fetchLatestTableRoute = createRoute(
      this,
      "fetchLatestTable",
      "fetchLatestTable",
      api,
      role,
      `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${fetchLatestTableLambda.functionArn}/invocations`
    );

    const disconnectZombieConnectionsRoute = createRoute(
      this,
      "disconnectZombieConnections",
      "disconnectZombieConnections",
      api,
      role,
      `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${disconnectZombieConnectionsLambda.functionArn}/invocations`
    );

    // ----- create lambda functions ------

    // ----- create deployment ------
    const deployment = new apigatewayv2.CfnDeployment(
      this,
      `${name}-deployment`,
      {
        apiId: api.ref,
      }
    );
    deployment.addDependsOn(api);
    deployment.addDependsOn(connectRoute);
    deployment.addDependsOn(disconnectRoute);
    deployment.addDependsOn(resetTableRoute);
    deployment.addDependsOn(updateTableRoute);
    deployment.addDependsOn(fetchLatestTableRoute);
    deployment.addDependsOn(disconnectZombieConnectionsRoute);
    deployment.addDependsOn(defaultRoute);

    // ----- create deployment ------

    // ----- create API stage ------
    const stage = new apigatewayv2.CfnStage(this, `${name}-stage`, {
      apiId: api.ref,
      autoDeploy: true,
      deploymentId: deployment.ref,
      stageName,
    });
    stage.addDependsOn(deployment);
    // ----- create API stage ------

    new CfnOutput(this, "apiRef", {
      value: api.ref,
    });

    new CfnOutput(this, "apiEndpoint", {
      value: api.attrApiEndpoint,
    });
  }
}

function createRoute(
  scope: Construct,
  id: string,
  routeKey: string,
  api: apigatewayv2.CfnApi,
  role: iam.Role,
  integrationUri: string
): apigatewayv2.CfnRoute {
  const integration = new apigatewayv2.CfnIntegration(
    scope,
    `${id}-lambda-integration`,
    {
      apiId: api.ref,
      integrationType: "AWS_PROXY",
      integrationUri,
      credentialsArn: role.roleArn,
    }
  );

  const route = new apigatewayv2.CfnRoute(scope, `${id}-route`, {
    apiId: api.ref,
    routeKey,
    authorizationType: "NONE",
    target: "integrations/" + integration.ref,
  });

  return route;
}
