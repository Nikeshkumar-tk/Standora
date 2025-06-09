import { LambdaConfig } from "@standora/common/types";
import { createLambdaHandler } from "@standora/common/utils/lambda";
import { handler as lamdaHandler } from "./handler";

export const config: LambdaConfig = {
  name: "organization",
  endpoints: [
    {
      name: "organization",
      methods: ["GET", "POST"],
      protected: false,
    },
  ],
};

export const handler = createLambdaHandler({ handler: lamdaHandler, config });
