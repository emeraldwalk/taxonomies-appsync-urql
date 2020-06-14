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
      name: name(tableName, 'Api'),
      authenticationType: 'API_KEY',
    })

    new CfnApiKey(this, name(tableName, 'ApiKey'), {
      apiId: api.attrApiId,
    })

    const apiSchema = new CfnGraphQLSchema(this, name(tableName, 'Schema'), {
      apiId: api.attrApiId,
      definition: String(
        readFileSync(join(__dirname, '..', '..', '..', 'schema.graphql'))
      ),
    })

    const table = new Table(this, name(tableName, 'Table'), {
      tableName: name(tableName),
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'sk',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
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

    const putContentResolver = new CfnResolver(this, 'PutContentResolver', {
      apiId: api.attrApiId,
      typeName: 'Mutation',
      fieldName: 'putContent',
      dataSourceName: dataSource.name,
      requestMappingTemplate: resolverTemplate('putContent.req.vtl'),
      responseMappingTemplate: resolverTemplate('true.res.vtl'),
    })
    putContentResolver.addDependsOn(apiSchema)
    putContentResolver.addDependsOn(dataSource)

    const getContentResolver = new CfnResolver(this, 'GetContentResolver', {
      apiId: api.attrApiId,
      typeName: 'Query',
      fieldName: 'getContent',
      dataSourceName: dataSource.name,
      requestMappingTemplate: resolverTemplate('getContent.req.vtl'),
      responseMappingTemplate: resolverTemplate('dataList.res.vtl'),
    })
    getContentResolver.addDependsOn(apiSchema)
    getContentResolver.addDependsOn(dataSource)
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

function name(prefix: string, suffix = '') {
  if (prefix) {
    prefix = prefix[0].toUpperCase() + prefix.slice(1)
  }

  if (suffix.length) {
    suffix = suffix[0].toUpperCase() + suffix.slice(1)
  }

  const name = `${prefix}${suffix}`

  if (name.length === 0) {
    throw Error('prefix or suffix must have at least 1 character.')
  }

  return name
}

function resolverTemplate(name: string): string {
  return String(readFileSync(join(__dirname, '..', 'resolvers', name)))
}
