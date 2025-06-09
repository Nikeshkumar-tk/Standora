import { LambdaConfig } from "@standora/common/types";
import { handler as lambdaHandler } from "./handler";
import { createLambdaHandler } from "@standora/common/utils/lambda";

export const config: LambdaConfig = {
  name: "authentication",
  endpoints: [
    {
      name: "signIn",
      methods: ["POST"],
      protected: false,
    },
    {
      name: "signUp",
      methods: ["POST"],
      protected: false,
    },
  ],
};

export const handler = createLambdaHandler({ handler: lambdaHandler, config });
