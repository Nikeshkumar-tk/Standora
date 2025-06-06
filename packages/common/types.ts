import { APIGatewayProxyEvent } from "aws-lambda";

export type ApiGateWayMethods = "GET" | "POST" | "PUT" | "PATCH";

export type ApiGateWayEndpointConfig = {
  name: string;
  protected: boolean;
  methods: ApiGateWayMethods[];
};

export type LambdaConfig = {
  name: string;
  endpoints: Array<ApiGateWayEndpointConfig>;
};

export type LamdaHandlerType = (event: APIGatewayProxyEvent) => Promise<any>;
