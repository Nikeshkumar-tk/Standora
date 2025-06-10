import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Lambdas } from "./lambdas";
import * as fns from "@lambdas";
import { StandoraApi } from "./api";
import { DynamoDBTable } from "./db/main";
import { createResourceName } from "@standora/common/utils/common";

const STAGE = process.env.STAGE || "dev";

export class StandoraStack extends Stack {
  public readonly lambdas: Lambdas;
  public readonly api: StandoraApi;
  public readonly table: DynamoDBTable;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.lambdas = new Lambdas(this, "standora-lambdas", fns);

    this.api = new StandoraApi(this, "standora-api", {
      lambdaFns: this.lambdas.functions,
      stage: STAGE,
    });

    this.table = new DynamoDBTable(this, "standora-table", {
      tableName: createResourceName("table", STAGE),
    });

    this.table.grandReadWriteForLambdas(
      this.getFnsFromConfigArray(this.lambdas.functions)
    );
  }

  getFnsFromConfigArray(lambdaConfigs: typeof this.lambdas.functions) {
    return lambdaConfigs.map((config) => config.fn);
  }
}
