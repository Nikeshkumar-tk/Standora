import { LambdaActions } from "@standora/aws/api/resource-actions";
import { CreateUserInput } from "@standora/aws/dynamo-db/models/user";
import { BadRequestError } from "@standora/common/error";
import { LamdaHandlerType } from "@standora/common/types";
import { convertEventBodyType } from "@standora/common/utils/lambda";
import { signUpUser } from "@standora/core/user";

export const handler: LamdaHandlerType = async ({ event, logger }) => {
  const action = event.action;

  switch (action) {
    case LambdaActions.SIGN_UP: {
      const input = convertEventBodyType<CreateUserInput>(event.body, logger);
      return await signUpUser(input);
    }
    default:
      throw new BadRequestError("Invalid action");
  }
};
