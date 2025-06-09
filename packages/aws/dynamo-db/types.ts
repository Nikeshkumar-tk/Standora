import { Logger } from "@aws-lambda-powertools/logger";

export type GetItem = {
  tableName?: string;
  pk: string;
  sk: string;
  logger: Logger;
};

export type PutItem = {
  tableName?: string;
  item: Record<string, any>;
  options?: {
    uniqueId?: {
      field: string;
    };
  };
};

export type PutBatchItems = {
  items: Record<string, unknown>[];
  logger: Logger;
};

export type BaseModelType = {
  PK: string;
  SK?: string;
  createdAt: number;
  updatedAt: number;
};
