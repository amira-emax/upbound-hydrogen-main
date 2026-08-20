// NOTE: https://shopify.dev/docs/api/admin-graphql/latest/queries/discountNodes
// Looks up a specific customer's active discounts (assigned via Shopify's
// native "Specific customers" discount eligibility) so they can be offered
// as pickable options in the cart. No manually-curated/duplicated list —
// this reads real discounts live from Shopify.
export const CART_DISCOUNTS_QUERY = `#graphql
  query CustomerCartDiscounts($query: String!) {
    discountNodes(first: 20, query: $query) {
      nodes {
        id
        discount {
          __typename
          ... on DiscountCodeBasic {
            title
            summary
            status
            codes(first: 1) {
              nodes {
                code
              }
            }
          }
          ... on DiscountCodeFreeShipping {
            title
            summary
            status
            codes(first: 1) {
              nodes {
                code
              }
            }
          }
          ... on DiscountCodeBxgy {
            title
            summary
            status
            codes(first: 1) {
              nodes {
                code
              }
            }
          }
        }
      }
    }
  }
`;

export type CartDiscountOption = {
  code: string;
  label: string;
};
