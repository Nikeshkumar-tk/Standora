import { LambdaConfig } from "@standora/common/types";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Duration } from "aws-cdk-lib";
import {
  buildLambdaDirEntry,
  LAMBDA_TIMEOUT,
} from "@standora/common/utils/lambda";
import { createResourceName } from "@standora/common/utils/common";

export class Lambdas extends Construct {
  public readonly functions: { config: LambdaConfig; fn: NodejsFunction }[] =
    [];
  constructor(
    scope: Construct,
    id: string,
    lambdas: Record<string, { config: LambdaConfig }>
  ) {
    super(scope, id);

    Object.entries(lambdas).forEach(([key, fn]) => {
      const functionName = createResourceName(
        fn.config.name,
        process.env.STAGE as string
      );

      const lambdaFunction = new NodejsFunction(this, fn.config.name, {
        entry: buildLambdaDirEntry(fn.config.name),
        handler: "index.handler",
        runtime: lambda.Runtime.NODEJS_18_X,
        functionName,
        bundling: {
          minify: true,
          bundleAwsSDK: false,
        },
        timeout: Duration.seconds(LAMBDA_TIMEOUT),
      });
      this.functions.push({ config: fn.config, fn: lambdaFunction });
    });
  }
}
