import {
  CreateOrganisationInput,
  Organization,
  OrganizationModel,
} from "@standora/aws/dynamo-db/models/organization";
import { ConflictError, NotFoundError } from "@standora/common/error";
import { Logger } from "@aws-lambda-powertools/logger";
import { UserModel } from "@standora/aws/dynamo-db/models/user";

/**
 * Creates a new organization with the specified name and email.
 *
 * This function first checks if an organization with the same name already exists.
 * If it does, a `ConflictError` is thrown. Otherwise, it creates a new organization
 * and links the organization to a user by their email.
 *
 * @param {CreateOrganisationInput} params - The input parameters for creating the organization.
 * @param {string} params.name - The name of the organization to create.
 * @param {string} params.email - The email address to associate with the organization.
 * @param {Logger} params.logger - The logger instance for logging operations.
 * @returns {Promise<Organization>} The newly created organization.
 * @throws {ConflictError} If an organization with the same name already exists.
 */
export const createOrganization = async ({
  name,
  logger,
  email,
}: CreateOrganisationInput): Promise<Organization> => {
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

  return organization as Organization;
};

/**
 * Links a user to an organization by their email address.
 *
 * This function retrieves a user by their email and, if found, creates an organization-user association.
 * Throws a `NotFoundError` if the user does not exist.
 *
 * @param params - The parameters for linking a user to an organization.
 * @param params.email - The email address of the user to link.
 * @param params.orgId - The ID of the organization.
 * @param params.orgName - The name of the organization.
 * @param params.logger - The logger instance for logging operations.
 * @returns A promise that resolves to the result of the organization-user creation.
 * @throws {NotFoundError} If no user is found for the given email.
 */
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
    throw new NotFoundError("User not found for the given email" + " " + email);
  }

  return await OrganizationModel.createOrgUser({
    orgId,
    orgName,
    userId: userInfo?.id,
    logger,
  });
};
