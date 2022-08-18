import {
  Callback,
  CloudWatchLogsEvent,
  CloudWatchLogsDecodedData,
  Context,
} from "aws-lambda";
import * as zlib from "zlib";

const https = require("https");
const url = require("url");
const slackUrl = process.env.SLACK_URL;

export const handler = async (
  input: CloudWatchLogsEvent,
  context: Context,
  callback: Callback
) => {
  const payload = Buffer.from(input.awslogs.data, "base64");
  try {
    const result = await new Promise<Buffer>((resolve, reject) => {
      zlib.gunzip(payload, (err, result) => {
        return err ? reject(err) : resolve(result);
      });
    });
    const parsedResult = JSON.parse(
      result.toString("ascii")
    ) as CloudWatchLogsDecodedData;

    const slackReqOptions = url.parse(slackUrl);
    slackReqOptions.method = "POST";
    slackReqOptions.headers = { "Content-Type": "application/json" };
    const params = {
      text: "--- *kue error.* ---",
      attachments: [
        {
          title: "error log",
          color: "#FF0000",
          text: [
            parsedResult.owner,
            parsedResult.logGroup,
            parsedResult.logStream,
            parsedResult.subscriptionFilters,
            parsedResult.messageType,
            parsedResult.logEvents
              .map((event) => {
                return event.message;
              })
              .join("\n"),
          ].join("\n"),
          mrkdwn_in: ["text"],
        },
      ],
    };
    var body = JSON.stringify(params);
    slackReqOptions.headers = {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
    };
    var req = https.request(slackReqOptions, function (res: any) {
      if (res.statusCode === 200) {
        console.log("Posted to slack");
        callback(null, { result: "ok" });
      } else {
        callback("failed to slack", {
          result: "ng",
          reason: "Failed to post slack " + res.statusCode,
        });
      }
      return res;
    });
    req.write(body);
    req.end();

    callback(null, "");
  } catch (err) {
    callback("failed to gunzip", null);
  }
};
