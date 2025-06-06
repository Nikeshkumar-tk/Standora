export const lambdaResponse = ({
  status,
  body,
}: {
  status: number;
  body: Record<string, unknown>;
}) => {
  return {
    statusCode: status,
    body: JSON.stringify(body || {}),
  };
};
