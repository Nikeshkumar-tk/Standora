import { Logger } from "@aws-lambda-powertools/logger";
import { BaseModelType } from "../../types";

export type Organization = BaseModelType & {
  name: string;
  id: string;
  orgEmail: string;
  adminEmail: string;
};

export type CreateOrganisationInput = {
  name: string;
  email: string;
  logger: Logger;
};

export type FetchOrganizationByNameInput = { name: string; logger: Logger };
