#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { StandoraStack } from "./stack";
import { createResourceName } from "@standora/common/utils/common";

const app = new cdk.App();

new StandoraStack(
  app,
  createResourceName("stack", process.env.STAGE as string),
  {
    env: {
      account: "933227355598",
      region: "us-east-1",
    },
  }
);
