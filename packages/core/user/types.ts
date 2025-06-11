import { Logger } from "@aws-lambda-powertools/logger";

export type SignInUserInput = {
  email: string;
  password: string;
  logger: Logger;
};
