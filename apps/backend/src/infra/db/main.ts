import { Construct } from "constructs";
import {
  Table,
  AttributeType,
  BillingMode,
  TableEncryption,
  ProjectionType,
} from "aws-cdk-lib/aws-dynamodb";
import { RemovalPolicy } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export interface DynamoDBTableProps {
  /**
   * The name of the DynamoDB table
   */
  tableName: string;

  /**
   * Billing mode for the table
   * @default BillingMode.PAY_PER_REQUEST
   */
  billingMode?: BillingMode;

  /**
   * Whether to enable point-in-time recovery
   * @default true
   */
  pointInTimeRecovery?: boolean;

  /**
   * Removal policy for the table
   * @default RemovalPolicy.RETAIN
   */
  removalPolicy?: RemovalPolicy;

  /**
   * Global Secondary Index configurations
   */
  globalSecondaryIndexes?: Array<{
    indexName: string;
    partitionKey: string;
    sortKey?: string;
    projectionType?: ProjectionType;
    nonKeyAttributes?: string[];
  }>;

  /**
   * Local Secondary Index configurations
   */
  localSecondaryIndexes?: Array<{
    indexName: string;
    sortKey: string;
    projectionType?: ProjectionType;
    nonKeyAttributes?: string[];
  }>;
}

export class DynamoDBTable extends Construct {
  public readonly table: Table;

  constructor(scope: Construct, id: string, props: DynamoDBTableProps) {
    super(scope, id);

    this.table = new Table(this, "stadora-table", {
      tableName: props.tableName,
      partitionKey: {
        name: "PK",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: AttributeType.STRING,
      },
      billingMode: props.billingMode ?? BillingMode.PAY_PER_REQUEST,
      encryption: TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: props.pointInTimeRecovery ?? true,
      removalPolicy: props.removalPolicy ?? RemovalPolicy.RETAIN,
    });

    if (props.globalSecondaryIndexes) {
      props.globalSecondaryIndexes.forEach((gsi) => {
        this.table.addGlobalSecondaryIndex({
          indexName: gsi.indexName,
          partitionKey: {
            name: gsi.partitionKey,
            type: AttributeType.STRING,
          },
          ...(gsi.sortKey && {
            sortKey: {
              name: gsi.sortKey,
              type: AttributeType.STRING,
            },
          }),
          projectionType: gsi.projectionType ?? ProjectionType.ALL,
          ...(gsi.nonKeyAttributes && {
            nonKeyAttributes: gsi.nonKeyAttributes,
          }),
        });
      });
    }

    if (props.localSecondaryIndexes) {
      props.localSecondaryIndexes.forEach((lsi) => {
        this.table.addLocalSecondaryIndex({
          indexName: lsi.indexName,
          sortKey: {
            name: lsi.sortKey,
            type: AttributeType.STRING,
          },
          projectionType: lsi.projectionType ?? ProjectionType.ALL,
          ...(lsi.nonKeyAttributes && {
            nonKeyAttributes: lsi.nonKeyAttributes,
          }),
        });
      });
    }
  }

  /**
   * Grant read permissions to a principal
   */
  grantRead(grantee: any) {
    return this.table.grantReadData(grantee);
  }

  /**
   * Grant write permissions to a principal
   */
  grantWrite(grantee: any) {
    return this.table.grantWriteData(grantee);
  }

  /**
   * Grant read and write permissions to a principal
   */
  grantReadWrite(grantee: any) {
    return this.table.grantReadWriteData(grantee);
  }

  /**
   * Grant full access permissions to a principal
   */
  grantFullAccess(grantee: any) {
    return this.table.grantFullAccess(grantee);
  }

  grandReadWriteForLambdas(lambdas: NodejsFunction[]) {
    lambdas.forEach((fn) => {
      this.table.grantReadWriteData(fn);
      fn.addEnvironment("DYNAMODB_TABLE", this.table.tableName);
    });
  }

  /**
   * Get the table ARN
   */
  get tableArn(): string {
    return this.table.tableArn;
  }

  /**
   * Get the table name
   */
  get tableName(): string {
    return this.table.tableName;
  }
}
