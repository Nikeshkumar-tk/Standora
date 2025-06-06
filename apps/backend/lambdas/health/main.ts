import { LambdaConfig } from "@standora/common/types";

export const config: LambdaConfig = {
  name: "health-check",
  endpoints: [
    {
      name: "/health",
      protected: false,
      methods: ["GET"],
    },
  ],
};
