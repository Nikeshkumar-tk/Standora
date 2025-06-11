import { Logger } from "@aws-lambda-powertools/logger";
import { RESOURCE_TO_ACTION_MAPPER } from "@standora/aws/api/resource-actions";
import { LambdaLayerLibs, LayerRegistry } from "@standora/layers/config";
import moduleAlias from "module-alias";
import { ZodError } from "zod";
import { HttpError, NotFoundError } from "../error";
import {
  BodyParser,
  LambdaConfig,
  LambdaHandlerEvent,
  LamdaHandlerType,
} from "../types";

export const LAMBDA_TIMEOUT = 30;

/**
 * Formats the Lambda HTTP response.
 */
export const lambdaResponse = ({
  status,
  body,
}: {
  status: number;
  body: Record<string, unknown>;
}) => ({
  statusCode: status,
  body: JSON.stringify(body || {}),
});

/**
 * Returns the Lambda function entry file path.
 */
export const buildLambdaDirEntry = (functionName: string) =>
  `src/lambdas/${functionName}/index.ts`;

/**
 * Checks if a body parser is provided and non-empty.
 */
export const checkBodyParser = (bodyParser?: BodyParser) =>
  !!bodyParser && Object.keys(bodyParser).length > 0;

/**
 * Parses the event body JSON string.
 */
export const parseEventBody = (eventBody: string) =>
  JSON.parse(eventBody || "{}");

/**
 * Type guard for ZodError.
 */
export const isZodError = (error: unknown): error is ZodError => {
  const errorName = (error as any).name;
  return error instanceof ZodError || errorName === "ZodError";
};

/**
 * Creates a readable error message from ZodError.
 */
export const createZodErrorMessage = (error: ZodError) =>
  error.issues.map((issue) => {
    const path = issue.path.join(".");
    return `${path ? `${path}: ` : ""}${issue.message}`;
  });

/**
 * Handles errors and returns a formatted response.
 */
export const handleError = (error: unknown) => {
  if (isZodError(error)) {
    return {
      status: 404,
      data: {
        message: "Validation Error",
        error: createZodErrorMessage(error),
      },
    };
  }
  if (error instanceof HttpError) {
    return {
      status: error.statusCode,
      data: { message: error.message },
    };
  }
  console.error(error);
  return {
    status: 500,
    data: { message: "Some unknow error occured" },
  };
};

/**
 * Retrieves the action configuration for a given resource and method.
 */
export const getHandlerActionConfig = (resource: string, method: string) => {
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

/**
 * Creates a Lambda handler with error handling, logging, and optional layers.
 */
export const createLambdaHandler = ({
  handler,
  config,
  layers = [],
}: {
  handler: LamdaHandlerType;
  config: LambdaConfig;
  layers?: LambdaLayerLibs[];
}) => {
  return async (event: LambdaHandlerEvent) => {
    try {
      const logger = new Logger({ serviceName: config.name });
      const { action, parserSchema } = getHandlerActionConfig(
        event.resource,
        event.httpMethod
      );

      if (!action) {
        throw new NotFoundError("Action not found");
      }

      const eventBodyJson = parseEventBody(event.body || "{}");

      if (parserSchema) {
        const parsedBody = parserSchema.parse(eventBodyJson);
        event.body = parsedBody;
      } else {
        event.body = eventBodyJson;
      }

      event.action = action;

      if (layers.length > 0) {
        registerLayers({ layers });
      }

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

/**
 * Registers module aliases for Lambda layers.
 */
export const registerLayers = ({
  layers,
}: {
  layers: LambdaLayerLibs[] | [];
}) => {
  if (layers.length === 0) return;
  for (const layerLib of layers) {
    const layerLibConfig = LayerRegistry[layerLib];
    moduleAlias.addAlias(layerLibConfig.alias, layerLibConfig.path);
  }
};

/**
 * Converts the event body to a specific type and attaches the logger.
 */
export const convertEventBodyType = <T>(
  eventBody: unknown,
  logger: Logger
): T =>
  ({
    ...(eventBody as Record<string, unknown>),
    logger,
  }) as T;
