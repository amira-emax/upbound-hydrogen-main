export const adminCustomerCreateMutation = `#graphql
  mutation customerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// export const adminCustomerUpdateMarketingMutation = `#graphql
//   mutation customerEmailMarketingConsentUpdate(
//     $input: CustomerEmailMarketingConsentUpdateInput!
//   ) {
//     customerEmailMarketingConsentUpdate(input: $input) {
//       customer {
//         id
//       }
//       userErrors {
//         field
//         message
//       }
//     }
//   }
// `;
