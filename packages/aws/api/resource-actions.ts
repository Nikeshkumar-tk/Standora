import { ApiGateWayMethods } from "./types";

export enum LambdaActions {
  SIGN_UP = "SIGN_UP",
  CREATE_ORGANIZATION = "CREATE_ORGANIZATION",
}

type ResourceToActionMapperType = Record<string, Record<string, LambdaActions>>;

export const RESOURCE_TO_ACTION_MAPPER: ResourceToActionMapperType = {
  "/signUp": {
    POST: LambdaActions.SIGN_UP,
  },
  "/organization": {
    POST: LambdaActions.CREATE_ORGANIZATION,
  },
} as const satisfies ResourceToActionMapperType;
