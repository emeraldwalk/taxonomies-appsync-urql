# Taxonomies

Experiment with `AppSync` GraphQL api built using `AWS CDK`.
Using `urql` graphql client and `"@graphql-codegen` for generating types + hooks. This is a monorepo containing a client and a server package that share a GraphQL schema.

## Client

React app created with `create-react-app` using `urql` as GraphQL client
and `@graphql-codegen` to generate types and hooks.

## Server

Project was created with AWS cdk
https://docs.aws.amazon.com/cdk/api/latest/

Project was initiated with

```
cdk init --language typescript
```

Resolver references:
https://github.com/bmingles/checkin/tree/master/packages/cra/amplify/backend/api/checkin/resolvers
