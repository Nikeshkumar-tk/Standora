import {
  CreateUserInput,
  UserModel,
} from "@standora/aws/dynamo-db/models/user";
import { ConflictError } from "../../common/error";

export const signUpUser = async (input: CreateUserInput) => {
  const existingEmailUser = await UserModel.getUserByEmail({
    email: input.email,
    logger: input.logger,
  });

  input.logger.info("User alreay exists", { existingEmailUser });

  if (existingEmailUser) {
    throw new ConflictError("A user with email already exists.");
  }

  return await UserModel.createUser(input);
};
