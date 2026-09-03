/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';

export type CustomerCartDiscountsQueryVariables = StorefrontAPI.Exact<{
  query: StorefrontAPI.Scalars['String']['input'];
}>;

export type CustomerCartDiscountsQuery = {
  discountNodes: {
    nodes: Array<
      Pick<StorefrontAPI.DiscountNode, 'id'> & {
        discount:
          | {
              __typename:
                | 'DiscountAutomaticApp'
                | 'DiscountAutomaticBasic'
                | 'DiscountAutomaticBxgy'
                | 'DiscountAutomaticFreeShipping'
                | 'DiscountCodeApp';
            }
          | ({__typename: 'DiscountCodeBasic'} & Pick<
              StorefrontAPI.DiscountCodeBasic,
              'title' | 'summary' | 'status'
            > & {
                codes: {
                  nodes: Array<Pick<StorefrontAPI.DiscountRedeemCode, 'code'>>;
                };
                customerSelection:
                  | Pick<StorefrontAPI.DiscountCustomerAll, 'allCustomers'>
                  | {customers: Array<Pick<StorefrontAPI.Customer, 'id'>>};
              })
          | ({__typename: 'DiscountCodeBxgy'} & Pick<
              StorefrontAPI.DiscountCodeBxgy,
              'title' | 'summary' | 'status'
            > & {
                codes: {
                  nodes: Array<Pick<StorefrontAPI.DiscountRedeemCode, 'code'>>;
                };
                customerSelection:
                  | Pick<StorefrontAPI.DiscountCustomerAll, 'allCustomers'>
                  | {customers: Array<Pick<StorefrontAPI.Customer, 'id'>>};
              })
          | ({__typename: 'DiscountCodeFreeShipping'} & Pick<
              StorefrontAPI.DiscountCodeFreeShipping,
              'title' | 'summary' | 'status'
            > & {
                codes: {
                  nodes: Array<Pick<StorefrontAPI.DiscountRedeemCode, 'code'>>;
                };
                customerSelection:
                  | Pick<StorefrontAPI.DiscountCustomerAll, 'allCustomers'>
                  | {customers: Array<Pick<StorefrontAPI.Customer, 'id'>>};
              });
      }
    >;
  };
};

export type CustomerCreateMutationVariables = StorefrontAPI.Exact<{
  input: StorefrontAPI.CustomerInput;
}>;

export type CustomerCreateMutation = {
  customerCreate?: StorefrontAPI.Maybe<{
    customer?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Customer, 'id' | 'email'>
    >;
    userErrors: Array<Pick<StorefrontAPI.UserError, 'field' | 'message'>>;
  }>;
};

interface GeneratedQueryTypes {
  '#graphql\n  query CustomerCartDiscounts($query: String!) {\n    discountNodes(first: 20, query: $query) {\n      nodes {\n        id\n        discount {\n          __typename\n          ... on DiscountCodeBasic {\n            title\n            summary\n            status\n            codes(first: 1) {\n              nodes {\n                code\n              }\n            }\n            customerSelection {\n              ... on DiscountCustomerAll {\n                allCustomers\n              }\n              ... on DiscountCustomers {\n                customers {\n                  id\n                }\n              }\n            }\n          }\n          ... on DiscountCodeFreeShipping {\n            title\n            summary\n            status\n            codes(first: 1) {\n              nodes {\n                code\n              }\n            }\n            customerSelection {\n              ... on DiscountCustomerAll {\n                allCustomers\n              }\n              ... on DiscountCustomers {\n                customers {\n                  id\n                }\n              }\n            }\n          }\n          ... on DiscountCodeBxgy {\n            title\n            summary\n            status\n            codes(first: 1) {\n              nodes {\n                code\n              }\n            }\n            customerSelection {\n              ... on DiscountCustomerAll {\n                allCustomers\n              }\n              ... on DiscountCustomers {\n                customers {\n                  id\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n': {
    return: CustomerCartDiscountsQuery;
    variables: CustomerCartDiscountsQueryVariables;
  };
}

interface GeneratedMutationTypes {
  '#graphql\n  mutation customerCreate($input: CustomerInput!) {\n    customerCreate(input: $input) {\n      customer {\n        id\n        email\n      }\n      userErrors {\n        field\n        message\n      }\n    }\n  }\n': {
    return: CustomerCreateMutation;
    variables: CustomerCreateMutationVariables;
  };
}

declare module '@shopify/hydrogen' {
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
