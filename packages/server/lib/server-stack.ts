import { Construct, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core'
import {
  CfnApiKey,
  CfnDataSource,
  CfnGraphQLApi,
  CfnGraphQLSchema,
  CfnResolver,
} from '@aws-cdk/aws-appsync'
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb'
import { ManagedPolicy, Role, ServicePrincipal } from '@aws-cdk/aws-iam'
import { readFileSync } from 'fs'
import { join } from 'path'

export class ServerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const tableName = 'taxonomies'

    const api = new CfnGraphQLApi(this, name(tableName, 'Api'), {
      name: 'taxonomies-api', // TODO: what should naming convention be here?
      authenticationType: 'API_KEY',
    })

    new CfnApiKey(this, name(tableName, 'ApiKey'), {
      apiId: api.attrApiId,
    })

    const apiSchema = new CfnGraphQLSchema(this, name(tableName, 'Schema'), {
      apiId: api.attrApiId,
      definition: String(
        readFileSync(join(__dirname, '../../../schema.graphql'))
      ),
    })

    const table = new Table(this, name(tableName, 'Table'), {
      tableName,
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
    })

    const tableRole = createDynamoDBFullAccessRole(
      this,
      tableName,
      'appsync.amazonaws.com'
    )

    const dataSource = new CfnDataSource(this, name(tableName, 'DataSource'), {
      apiId: api.attrApiId,
      name: name(tableName, 'DynamoDataSource'),
      type: 'AMAZON_DYNAMODB',
      dynamoDbConfig: {
        tableName: table.tableName,
        awsRegion: this.region,
      },
      serviceRoleArn: tableRole.roleArn,
    })

    const getContentResolver = new CfnResolver(
      this,
      'GetContentQueryResolver',
      {
        apiId: api.attrApiId,
        typeName: 'Query',
        fieldName: 'getContent',
        dataSourceName: dataSource.name,
        requestMappingTemplate: `{
          "version": "2017-02-28",
          "operation": "Query",
          "query": {
            "expression": "pk = :pk",
            "expressionValues": {
                ":pk": "CONTENT"
            }
          }
        }`,
        responseMappingTemplate: '$util.toJson($ctx.result)',
      }
    )
    getContentResolver.addDependsOn(apiSchema)
  }
}

/**
 * Create a role with an AmazonDynamoDBFullAccess policy and assumed by a given
 * service name.
 */
function createDynamoDBFullAccessRole(
  scope: Construct,
  tableName: string,
  servicePrincipalName: string
) {
  const taxonomiesTableRole = new Role(scope, name(tableName, 'DynamoDBRole'), {
    assumedBy: new ServicePrincipal(servicePrincipalName),
  })

  taxonomiesTableRole.addManagedPolicy(
    ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess')
  )

  return taxonomiesTableRole
}

function name(prefix: string, suffix: string) {
  prefix = prefix[0].toUpperCase() + prefix.slice(1)
  suffix = suffix[0].toUpperCase() + suffix.slice(1)

  return `${prefix}${suffix}`
}
