export type ApiGateWayMethods = "GET" | "POST" | "PUT" | "PATCH";

export type ApiGateWayEndpointConfig = {
  name: string;
  protected: boolean;
  methods: ApiGateWayMethods[];
};
