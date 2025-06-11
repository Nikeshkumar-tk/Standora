import {
  CreateUserInput,
  UserAuthType,
  UserModel,
} from "@standora/aws/dynamo-db/models/user";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "@standora/common/error";
import { SignInUserInput } from "./types";

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

export const signInUser = async ({
  email,
  password,
  logger,
}: SignInUserInput) => {
  const user = await UserModel.getUserByEmail({ email, logger });

  if (!user) {
    throw new NotFoundError("User not for the given email. ");
  }

  if (user.authType === UserAuthType.Credentials) {
    const isValidPassword = await UserModel.verifyPassword({
      password,
      hash: user.password as string,
    });

    if (!isValidPassword) {
      throw new BadRequestError("Invalid Password");
    }
  }

  return user;
};
