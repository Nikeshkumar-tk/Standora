import { Logger } from "@aws-lambda-powertools/logger";
import { BaseModelType } from "../../types";

export enum UserAuthType {
  Credentials = "Credentials",
}

export type User = BaseModelType & {
  email: string;
  fullName: string;
  lastLogin: string | null;
  authType: UserAuthType;
  password?: string;
  id: string;
};

export type CreateUserInput = {
  fullName: string;
  email: string;
  authType: UserAuthType;
  password?: string;
  logger: Logger;
};
