export enum HandlerActions {
  SIGN_UP = "SIGN_UP",
}

export const RESOURCE_TO_ACTION_MAPPER = {
  "/signUp": HandlerActions.SIGN_UP,
};

export const getHandlerAction = (resource: string) => {
  const action =
    RESOURCE_TO_ACTION_MAPPER[
      resource as keyof typeof RESOURCE_TO_ACTION_MAPPER
    ];

  if (!action) {
    throw new Error("No action provided");
  }

  return action;
};
