export enum LambdaLayerLibs {
  Bcrypt = "bcrypt",
  Jwt = "jsonwebtoken",
}

export type LayerRegistryType = Record<
  LambdaLayerLibs,
  {
    name: string;
    version: string;
    description: string;
    alias: string;
    path: string;
  }
>;

const createLayerAlias = ({ layerName }: { layerName: string }) => {
  return `@standora/layers/nodejs/${layerName}`;
};

export const LayerRegistry: LayerRegistryType = {
  [LambdaLayerLibs.Bcrypt]: {
    name: "bcrypt",
    version: "5.1.0",
    description: "A library to help you hash passwords",
    alias: createLayerAlias({ layerName: LambdaLayerLibs.Bcrypt }),
    path: "/opt/nodejs/bcrypt",
  },
  [LambdaLayerLibs.Jwt]: {
    name: "jsonwebtoken",
    version: "9.0.0",
    description: "A library to help you sign and verify JWT tokens",
    alias: createLayerAlias({ layerName: LambdaLayerLibs.Jwt }),
    path: "/opt/nodejs/jsonwebtoken",
  },
};
