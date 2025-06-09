import { LambdaConfig } from "@standora/common/types";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export interface ApiGatewayProps {
  stage: string;
  apiName?: string;
  description?: string;
  allowedOrigins?: string[];
  lambdaFns: { config: LambdaConfig; fn: NodejsFunction }[];
}

export class StandoraApi extends Construct {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiGatewayProps) {
    super(scope, id);

    const {
      stage,
      apiName = `standora-api-${stage}`,
      description = `Standora API Gateway for ${stage} environment`,
      allowedOrigins,
    } = props;

    const corsOrigins =
      allowedOrigins ||
      (stage === "prod"
        ? ["https://your-domain.com"]
        : apigateway.Cors.ALL_ORIGINS);

    this.api = new apigateway.RestApi(this, "StandoraApi", {
      restApiName: apiName,
      description: description,
      deployOptions: { stageName: stage },
      defaultCorsPreflightOptions: {
        allowOrigins: corsOrigins,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
          "X-Amz-Security-Token",
          "X-Amz-User-Agent",
        ],
        allowCredentials: true,
      },
    });

    this.attachFnsToApi(props.lambdaFns);
  }

  public attachFnsToApi(lambdaFns: ApiGatewayProps["lambdaFns"]) {
    lambdaFns.forEach((fn) => {
      const lambdaIntegration = new apigateway.LambdaIntegration(fn.fn);

      fn.config.endpoints.forEach((endpoint) => {
        const resource = this.api.root.addResource(endpoint.name);

        endpoint.methods.forEach((method) => {
          resource.addMethod(method, lambdaIntegration);
        });
      });
    });
  }

  public getApiUrl(): string {
    return this.api.url;
  }

  public getApiId(): string {
    return this.api.restApiId;
  }
}
