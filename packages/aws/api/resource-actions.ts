import { ZodSchema } from "zod";
import { signUpSchema } from "./schemas";

export enum LambdaActions {
  SIGN_UP = "SIGN_UP",
  SIGN_IN = "SIGN_IN",
  CREATE_ORGANIZATION = "CREATE_ORGANIZATION",
}

type ResourceToActionMapperType = Record<
  string,
  Record<string, { action: LambdaActions; parserSchema?: ZodSchema }>
>;

export const RESOURCE_TO_ACTION_MAPPER: ResourceToActionMapperType = {
  "/signUp": {
    POST: {
      action: LambdaActions.SIGN_UP,
      parserSchema: signUpSchema,
    },
  },
  "/signIn": {
    POST: {
      action: LambdaActions.SIGN_IN,
    },
  },
  "/organization": {
    POST: {
      action: LambdaActions.CREATE_ORGANIZATION,
    },
  },
} as const satisfies ResourceToActionMapperType;
