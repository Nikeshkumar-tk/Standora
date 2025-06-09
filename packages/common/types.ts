import { Logger } from "@aws-lambda-powertools/logger";
import { LambdaActions } from "@standora/aws/api/resource-actions";
import {
  ApiGateWayEndpointConfig,
  ApiGateWayMethods,
} from "@standora/aws/api/types";
import { APIGatewayProxyEvent } from "aws-lambda";
import { ZodSchema } from "zod";

export type LambdaConfig = {
  name: string;
  endpoints: Array<ApiGateWayEndpointConfig>;
};

export type BodyParser = Record<ApiGateWayMethods, ZodSchema>;

export type LambdaHandlerEvent = APIGatewayProxyEvent & {
  body: Record<string, any>;
  action: LambdaActions;
};
export type LamdaHandlerType = ({}: {
  event: LambdaHandlerEvent;
  logger: Logger;
}) => Promise<any>;
