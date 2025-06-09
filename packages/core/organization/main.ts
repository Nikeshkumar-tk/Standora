import {
  CreateOrganisationInput,
  OrganizationModel,
} from "@standora/aws/dynamo-db/models/organization";
import { ConflictError, NotFoundError } from "@standora/common/error";
import { Logger } from "@aws-lambda-powertools/logger";
import { UserModel } from "@standora/aws/dynamo-db/models/user";

export const createOrganization = async ({
  name,
  logger,
  email,
}: CreateOrganisationInput) => {
  const existingOrg = await OrganizationModel.getOrganizationByName({
    name,
    logger,
  });
  if (existingOrg) {
    throw new ConflictError("An organization with same name already exists.");
  }

  const organization = await OrganizationModel.createOrganisation({
    email,
    name,
    logger,
  });

  await linkOrgUserByEmail({
    email,
    orgId: organization.id,
    orgName: organization.name,
    logger,
  });
  return organization;
};

export const linkOrgUserByEmail = async ({
  email,
  orgId,
  orgName,
  logger,
}: {
  email: string;
  orgId: string;
  orgName: string;
  logger: Logger;
}) => {
  const userInfo = await UserModel.getUserByEmail({ email, logger });
  if (!userInfo) {
    throw new NotFoundError("User not found for the given email" + email);
  }
  return await OrganizationModel.createOrgUser({
    orgId,
    orgName,
    userId: userInfo?.id,
    logger,
  });
};
