#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { KueStack } from "../lib/kue-stack";

const app = new cdk.App();

new KueStack(app, "KueStack");
