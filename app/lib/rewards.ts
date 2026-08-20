import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {
  CART_DISCOUNTS_QUERY,
  type CartDiscountOption,
} from '~/graphql/admin/CartDiscountsQuery';
import {CUSTOMER_ID_QUERY} from '~/graphql/customer-account/CustomerIdQuery';

export type {CartDiscountOption};

export type RewardsSummary = {
  points: number;
  tier: string;
  nextTier: string | null;
  nextTierAt: number | null;
};

export type AvailableVoucher = {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
};

/**
 * Look up the logged-in customer's own active discounts (assigned via
 * Shopify's native "Specific customers" discount eligibility). Used both by
 * the cart's discount picker and the account "My Rewards" page. Guests and
 * stores without an Admin API client configured simply get no personalized
 * discounts — never throws, so a failure here should never break the page.
 */
export async function getCustomerVouchers(
  context: LoaderFunctionArgs['context'],
): Promise<CartDiscountOption[]> {
  try {
    const {customerAccount, adminApiClient} = context;

    if (!adminApiClient || !(await customerAccount.isLoggedIn())) {
      return [];
    }

    const {data: customerData} = await customerAccount.query(
      CUSTOMER_ID_QUERY,
    );
    const numericId = customerData?.customer?.id?.split('/').pop();
    if (!numericId) return [];

    const {data: discountData, errors} = await adminApiClient.request(
      CART_DISCOUNTS_QUERY,
      {
        variables: {query: `customer_ids:${numericId} status:active`},
      },
    );
    if (errors) {
      console.error('Admin API errors fetching customer vouchers:', errors);
      return [];
    }

    const nodes = discountData?.discountNodes?.nodes ?? [];
    return nodes.reduce((options: CartDiscountOption[], node: any) => {
      const discount = node?.discount;
      const code = discount?.codes?.nodes?.[0]?.code;
      if (code) {
        options.push({code, label: discount.title || discount.summary || code});
      }
      return options;
    }, []);
  } catch (error) {
    console.error('Failed to load customer vouchers:', error);
    return [];
  }
}

/**
 * TODO: replace with a real rewards/points API call once the loyalty
 * program's points/tier service exists. Dummy data for now so the "My
 * Rewards" page has something to render.
 */
export async function getCustomerRewardsSummary(
  _context: LoaderFunctionArgs['context'],
): Promise<RewardsSummary> {
  return {
    points: 1250,
    tier: 'Silver',
    nextTier: 'Gold',
    nextTierAt: 2000,
  };
}

/**
 * TODO: replace with a real "available vouchers" catalog API call once it
 * exists. Dummy data for now so the "Available Vouchers" page has something
 * to render.
 */
export async function getAvailableVouchersToClaim(
  _context: LoaderFunctionArgs['context'],
): Promise<AvailableVoucher[]> {
  return [
    {
      id: 'v1',
      title: '10% Off Voucher',
      description: 'Redeem for 10% off your next order',
      pointsCost: 500,
    },
    {
      id: 'v2',
      title: 'Free Shipping',
      description: 'Free shipping on your next order',
      pointsCost: 300,
    },
    {
      id: 'v3',
      title: 'RM20 Off',
      description: 'RM20 off orders above RM150',
      pointsCost: 800,
    },
  ];
}
