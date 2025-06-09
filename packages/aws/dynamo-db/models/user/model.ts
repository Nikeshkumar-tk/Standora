import { randomBytes } from "crypto";
import { getDdbItem, putBatchItems, putDdbItem } from "../../client";
import { CreateUserInput, User, UserAuthType } from "./types";
import { DbError, NotProvidedError } from "@standora/common/error";
import { Logger } from "@aws-lambda-powertools/logger";
import { generateIdWithPrefix } from "@standora/common/utils/common";

export class UserModel {
  static getPk() {
    return `USER`;
  }

  static getEmailSk({ email }: { email: string }) {
    return `EMAIL#${email}`;
  }

  static getIdSk({ id }: { id: string }) {
    return `ID#${id}`;
  }

  static async createUser(input: CreateUserInput) {
    const { logger, ...userData } = input;
    if (input.authType === UserAuthType.Credentials && !input.password) {
      throw new NotProvidedError("Password not provided");
    }

    const currentTimeStamp = Date.now();

    const userObj: User = {
      ...userData,
      PK: this.getPk(),
      createdAt: currentTimeStamp,
      updatedAt: currentTimeStamp,
      id: generateIdWithPrefix({ prefix: "user" }),
      lastLogin: null,
    };

    const dbItems = [
      {
        item: { ...userObj, SK: this.getEmailSk({ email: userObj.email }) },
      },
      {
        item: { ...userObj, SK: this.getIdSk({ id: userObj.id }) },
      },
    ];

    const response = await putBatchItems({ items: dbItems, logger });

    if (response.$metadata.httpStatusCode !== 200) {
      throw new DbError("Failed to create user");
    }

    return userObj;
  }

  static async getUserByEmail({
    email,
    logger,
  }: {
    email: string;
    logger: Logger;
  }) {
    const user = await getDdbItem<User>({
      pk: this.getPk(),
      sk: this.getEmailSk({ email }),
      logger,
    });
    return user;
  }

  static async getUserById({ id, logger }: { id: string; logger: Logger }) {
    const user = await getDdbItem<User>({
      pk: this.getPk(),
      sk: this.getIdSk({ id }),
      logger,
    });
    return user;
  }
}
