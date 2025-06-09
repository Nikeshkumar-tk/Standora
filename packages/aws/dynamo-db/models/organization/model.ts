import { DbError, NotFoundError } from "@standora/common/error";
import { getDdbItem, putBatchItems } from "../../client";
import {
  CreateOrganisationInput,
  FetchOrganizationByNameInput,
  Organization,
} from "./types";
import { generateIdWithPrefix } from "@standora/common/utils/common";
import { Logger } from "@aws-lambda-powertools/logger";
import { UserModel } from "../user";

export class OrganizationModel {
  static getNamePk({ name }: { name: string }) {
    return `ORG#${name}`;
  }

  static getNameSk({ name }: { name: string }) {
    return `ORG#${name}`;
  }

  static getIdPk({ id }: { id: string }) {
    return `ORG#${id}`;
  }

  static getIdSk({ id }: { id: string }) {
    return `ORG#${id}`;
  }

  static getOrgUserPk({ orgId }: { orgId: string }) {
    return `ORG_USERS#${orgId}`;
  }

  static getOrgUserSk({ userId }: { userId: string }) {
    return `USERS#ID${userId}`;
  }

  static getUserOrgPk({ userId }: { userId: string }) {
    return `USER_ORGS#${userId}`;
  }

  static getUserOrgSk({ orgId }: { orgId: string }) {
    return `ORGS#ID${orgId}`;
  }

  static async createOrganisation(input: CreateOrganisationInput) {
    const currentTimeStamp = Date.now();
    const orgObj: Omit<Organization, "PK"> = {
      name: input.name,
      createdAt: currentTimeStamp,
      updatedAt: currentTimeStamp,
      orgEmail: input.email,
      adminEmail: input.email,
      id: generateIdWithPrefix({ prefix: "org" }),
    };

    const dynamoItems = [
      {
        ...orgObj,
        PK: this.getNamePk({ name: input.name }),
        SK: this.getNameSk({ name: input.name }),
      },
      {
        ...orgObj,
        PK: this.getIdPk({ id: orgObj.id }),
        SK: this.getIdSk({ id: orgObj.id }),
      },
    ];

    const response = await putBatchItems({
      items: dynamoItems,
      logger: input.logger,
    });

    if (response.$metadata.httpStatusCode !== 200) {
      throw new DbError("Failed to create organization");
    }
    return orgObj;
  }

  static async getOrganizationByName({
    name,
    logger,
  }: FetchOrganizationByNameInput) {
    return await getDdbItem<Organization>({
      pk: this.getNamePk({ name }),
      sk: this.getNameSk({ name }),

      logger,
    });
  }

  static async getOrganizationById({
    id,
    logger,
  }: {
    id: string;
    logger: Logger;
  }) {
    return await getDdbItem({
      pk: this.getIdPk({ id }),
      sk: this.getIdSk({ id }),
      logger,
    });
  }

  static async createOrgUser({
    logger,
    orgId,
    orgName,
    userId,
  }: {
    userId: string;
    orgId: string;
    orgName: string;
    logger: Logger;
  }) {
    logger.info("Creating org user", { userId, orgId, orgName });

    const userInfo = await UserModel.getUserById({ id: userId, logger });

    if (!userInfo) {
      logger.error("User not found for the given user id", { userId });
      throw new NotFoundError("User not found");
    }

    const userData = {
      fullName: userInfo.fullName,
      email: userInfo.email,
    };

    const dbItems = [
      {
        ...userData,
        PK: this.getOrgUserPk({ orgId }),
        SK: this.getOrgUserSk({ userId }),
      },
      {
        ...userData,
        PK: this.getUserOrgPk({ userId }),
        SK: this.getUserOrgSk({ orgId }),
        orgId,
        orgName,
      },
    ];

    const result = await putBatchItems({ items: dbItems, logger });

    if (result.$metadata.httpStatusCode !== 200) {
      throw new DbError("Failed to create Org User");
    }

    return userInfo;
  }
}
