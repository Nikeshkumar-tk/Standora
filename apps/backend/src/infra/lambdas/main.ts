import { LambdaConfig } from "@standora/common/types";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import {
  buildLambdaDirEntry,
  LAMBDA_TIMEOUT,
} from "@standora/common/utils/lambda";
import { createResourceName } from "@standora/common/utils/common";
import path from "path";

export class Lambdas extends Construct {
  public readonly functions: { config: LambdaConfig; fn: NodejsFunction }[] =
    [];
  constructor(
    scope: Construct,
    id: string,
    lambdas: Record<string, { config: LambdaConfig }>
  ) {
    super(scope, id);

    const lambdaLayer = new lambda.LayerVersion(this, "lambda-layer", {
      code: lambda.Code.fromAsset(
        path.resolve(__dirname, "../../../../../packages/layers/dist")
      ),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      description: "Lambda layer for shared code",
      removalPolicy: RemovalPolicy.DESTROY,
    });

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
        layers: [lambdaLayer],
      });
      this.functions.push({ config: fn.config, fn: lambdaFunction });
    });
  }
}
