import { LambdaActions } from "@standora/aws/api/resource-actions";
import { CreateOrganisationInput } from "@standora/aws/dynamo-db/models/organization";
import { BadRequestError } from "@standora/common/error";
import { LamdaHandlerType } from "@standora/common/types";
import { convertEventBodyType } from "@standora/common/utils/lambda";
import { createOrganization } from "@standora/core/organization";

export const handler: LamdaHandlerType = async ({ event, logger }) => {
  switch (event.action) {
    case LambdaActions.CREATE_ORGANIZATION: {
      const input = convertEventBodyType<CreateOrganisationInput>(
        event.body,
        logger
      );
      return await createOrganization(input);
    }
    default:
      throw new BadRequestError("Invalid action");
  }
};
