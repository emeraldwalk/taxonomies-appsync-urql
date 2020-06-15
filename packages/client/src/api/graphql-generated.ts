import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type CategoryResult = {
  __typename?: 'CategoryResult';
  name: Scalars['String'];
  value: Scalars['String'];
};

export type ContentResult = {
  __typename?: 'ContentResult';
  id: Scalars['String'];
  categories?: Maybe<Array<CategoryResult>>;
  tags?: Maybe<Array<Scalars['String']>>;
  value: Scalars['String'];
};

export type CategoryInput = {
  name: Scalars['String'];
  value: Scalars['String'];
};

export type ContentInput = {
  id?: Maybe<Scalars['String']>;
  categories?: Maybe<Array<CategoryInput>>;
  tags?: Maybe<Array<Scalars['String']>>;
  value: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  putContent: Scalars['Boolean'];
};


export type MutationPutContentArgs = {
  input: ContentInput;
};

export type Query = {
  __typename?: 'Query';
  getContent: Array<ContentResult>;
};

export type GetContentQueryVariables = Exact<{ [key: string]: never; }>;


export type GetContentQuery = (
  { __typename?: 'Query' }
  & { getContent: Array<(
    { __typename?: 'ContentResult' }
    & Pick<ContentResult, 'id' | 'tags' | 'value'>
    & { categories?: Maybe<Array<(
      { __typename?: 'CategoryResult' }
      & Pick<CategoryResult, 'name' | 'value'>
    )>> }
  )> }
);


export const GetContentDocument = gql`
    query GetContent {
  getContent {
    id
    categories {
      name
      value
    }
    tags
    value
  }
}
    `;

export function useGetContentQuery(options: Omit<Urql.UseQueryArgs<GetContentQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<GetContentQuery>({ query: GetContentDocument, ...options });
};