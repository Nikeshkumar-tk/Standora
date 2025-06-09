import { Logger } from "@aws-lambda-powertools/logger";
import { RESOURCE_TO_ACTION_MAPPER } from "@standora/aws/api/resource-actions";
import { ZodError } from "zod";
import { HttpError, NotFoundError } from "../error";
import {
  BodyParser,
  LambdaConfig,
  LambdaHandlerEvent,
  LamdaHandlerType,
} from "../types";
import { ApiGateWayMethods } from "@standora/aws/api/types";

export const LAMBDA_TIMEOUT = 30;

export const lambdaResponse = ({
  status,
  body,
}: {
  status: number;
  body: Record<string, unknown>;
}) => {
  return {
    statusCode: status,
    body: JSON.stringify(body || {}),
  };
};

export const buildLambdaDirEntry = (functionName: string) => {
  return `src/lambdas/${functionName}/index.ts`;
};

export const checkBodyParser = (bodyParser?: BodyParser) => {
  if (!bodyParser) {
    return false;
  }
  return Object.keys(bodyParser || {}).length > 0;
};

export const parseEventBody = (eventBody: string) =>
  JSON.parse(eventBody || "{}");

export const handleError = (error: unknown) => {
  if (error instanceof ZodError) {
    return {
      status: 404,
      data: {
        message: "Validation Error",
        error: error.message,
      },
    };
  } else if (error instanceof HttpError) {
    return {
      status: error.statusCode,
      data: {
        message: error.message,
      },
    };
  } else {
    console.error(error); // ==> For debugging
    return {
      status: 500,
      data: {
        message: "Some unknow error occured",
      },
    };
  }
};

export const getHandlerAction = (resource: string, method: string) => {
  const resourceConfig =
    RESOURCE_TO_ACTION_MAPPER[
      resource as keyof typeof RESOURCE_TO_ACTION_MAPPER
    ];

  if (!resourceConfig) {
    throw new NotFoundError("Resource config not found");
  }

  const action = resourceConfig[method];

  if (!action) {
    throw new Error("No action provided");
  }

  return action;
};

export const createLambdaHandler = ({
  handler,
  bodyParser,
  config,
}: {
  handler: LamdaHandlerType;
  bodyParser?: BodyParser;
  config: LambdaConfig;
}) => {
  return async (event: LambdaHandlerEvent) => {
    try {
      const logger = new Logger({ serviceName: config.name });

      const action = getHandlerAction(event.resource, event.httpMethod);

      if (!action) {
        throw new NotFoundError("Action not found");
      }

      // This portion should be handler better
      if (bodyParser && checkBodyParser(bodyParser)) {
        const method = event.httpMethod as ApiGateWayMethods;
        const parser = bodyParser[method];
        const parsedBody = parser.parse(parseEventBody(event.body || "{}"));
        event.body = parsedBody;
      } else {
        event.body = parseEventBody(event.body || "{}");
      }

      event.action = action;

      const res = await handler({ event, logger });

      return lambdaResponse({
        status: 200,
        body: res,
      });
    } catch (error) {
      const { data, status } = handleError(error);
      return lambdaResponse({ status, body: data });
    }
  };
};

export const convertEventBodyType = <T>(
  eventBody: unknown,
  logger: Logger
): T => {
  return { ...(eventBody as Record<string, unknown>), logger } as T;
};
