import { Logger } from "@aws-lambda-powertools/logger";
import { DbError, NotProvidedError } from "@standora/common/error";
import { generateIdWithPrefix } from "@standora/common/utils/common";
import { getDdbItem, putBatchItems } from "../../client";
import { CreateUserInput, User, UserAuthType } from "./types";
import bcrypt from "@standora/layers/nodejs/bcrypt";
export class UserModel {
  static passwordHashSaltRounds: number = 10;
  static getIdPk({ id }: { id: string }) {
    return `USER#${id}`;
  }

  static getEmailPk({ email }: { email: string }) {
    return `USER#${email}`;
  }

  static getEmailSk({ email }: { email: string }) {
    return `EMAIL#${email}`;
  }

  static getIdSk({ id }: { id: string }) {
    return `ID#${id}`;
  }

  static async createUser(input: CreateUserInput) {
    const { logger, ...userData } = input;

    if (userData.authType === UserAuthType.Credentials && !userData.password) {
      throw new NotProvidedError("Password not provided");
    }

    if (userData.authType === UserAuthType.Credentials) {
      userData.password = await this.hashUserPassword({
        password: userData.password as string,
      });
    }

    const currentTimeStamp = Date.now();

    const userObj: Omit<User, "PK"> = {
      ...userData,
      createdAt: currentTimeStamp,
      updatedAt: currentTimeStamp,
      id: generateIdWithPrefix({ prefix: "user" }),
      lastLogin: null,
    };

    const dbItems = [
      {
        ...userObj,
        PK: this.getIdPk({ id: userObj.id }),
        SK: this.getIdSk({ id: userObj.id }),
      },
      {
        ...userObj,
        PK: this.getEmailPk({ email: userObj.email }),
        SK: this.getEmailSk({ email: userObj.email }),
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
      pk: this.getEmailPk({ email }),
      sk: this.getEmailSk({ email }),
      logger,
    });
    return user;
  }

  static async getUserById({ id, logger }: { id: string; logger: Logger }) {
    const user = await getDdbItem<User>({
      pk: this.getIdPk({ id }),
      sk: this.getIdSk({ id }),
      logger,
    });
    return user;
  }

  static async hashUserPassword({
    password,
  }: {
    password: string;
  }): Promise<string> {
    const salt = await bcrypt.genSalt(this.passwordHashSaltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  static async verifyPassword({
    password,
    hash,
  }: {
    password: string;
    hash: string;
  }) {
    return await bcrypt.compare(password, hash);
  }
}
