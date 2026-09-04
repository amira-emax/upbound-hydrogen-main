// NOTE: https://shopify.dev/docs/api/customer/latest/queries/customer
// Minimal query — id + email + the rewards whitelist flag. The id looks up
// this customer's discounts via the Admin API; the email looks up their
// rewards via the loyalty API; testAccount gates the rewards feature while
// it's still being rolled out (see isRewardsEligible in ~/lib/rewards).
export const CUSTOMER_ID_QUERY = `#graphql
  query CustomerId {
    customer {
      id
      emailAddress {
        emailAddress
      }
      testAccount: metafield(namespace: "custom", key: "test_account") {
        value
      }
    }
  }
` as const;
