import { LamdaHandlerType } from "@standora/common/types";
import { lambdaResponse } from "@standora/common/utils/lambda";

export const handler: LamdaHandlerType = async (event) => {
  return lambdaResponse({ status: 200, body: { ok: true } });
};
