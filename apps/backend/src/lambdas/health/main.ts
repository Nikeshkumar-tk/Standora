import { LambdaConfig } from "@standora/common/types";
import { handler as lamdaHandler } from "./handler";

export const config: LambdaConfig = {
  name: "health",
  endpoints: [
    {
      name: "health",
      protected: false,
      methods: ["GET"],
    },
  ],
};

export const handler = lamdaHandler;
