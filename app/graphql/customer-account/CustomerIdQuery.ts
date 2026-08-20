// NOTE: https://shopify.dev/docs/api/customer/latest/queries/customer
// Minimal query — just the ID, used to look up this customer's discounts via the Admin API.
export const CUSTOMER_ID_QUERY = `#graphql
  query CustomerId {
    customer {
      id
    }
  }
` as const;
