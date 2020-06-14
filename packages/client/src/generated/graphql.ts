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

export type Category = {
  __typename?: 'Category';
  name: Scalars['String'];
  value: Scalars['String'];
};

export type Content = {
  __typename?: 'Content';
  categories?: Maybe<Array<Category>>;
  tags?: Maybe<Array<Scalars['String']>>;
  value: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  getContent: Array<Content>;
  putContent: Scalars['Boolean'];
};


export type QueryPutContentArgs = {
  id?: Maybe<Scalars['String']>;
  value: Scalars['String'];
};

export type GetContentQueryVariables = Exact<{ [key: string]: never; }>;


export type GetContentQuery = (
  { __typename?: 'Query' }
  & { getContent: Array<(
    { __typename?: 'Content' }
    & Pick<Content, 'tags' | 'value'>
    & { categories?: Maybe<Array<(
      { __typename?: 'Category' }
      & Pick<Category, 'name' | 'value'>
    )>> }
  )> }
);


export const GetContentDocument = gql`
    query GetContent {
  getContent {
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