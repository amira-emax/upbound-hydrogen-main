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

// Shape mirrors one entry of `unredeemed_rewards` from the real loyalty API
// (see getAvailableVouchersToClaim below) so wiring in the live fetch later
// is just a field mapping, not a redesign.
export type AvailableVoucher = {
  id: string; // reward_id
  title: string; // name
  description: string | null;
  rewardType: string; // reward_type, e.g. "discount"
  pointsCost: number; // points_required
  discountType: 'fixed' | 'percentage' | null; // reward.discount_type — fixed = RM, percentage = %
  discountValue: number | null;
  minSpend: number | null;
  minQuantity: number;
  // Number of times this voucher may be redeemed per customer.
  maxRedeem: number;
  hasExpiry: boolean;
  // When false the customer hasn't met this voucher's requirements — the
  // voucher must be shown read-only (not redeemable) rather than hidden.
  isEligible: boolean;
  // Not supplied by the loyalty API yet — VoucherCard falls back to a
  // placeholder icon until an image field is added.
  imageUrl?: string | null;
};

// Shopify's auto-generated discount summary appends who it's scoped to, e.g.
// "5% off orders over RM50 For Amira Farisa" or "...For 1 customer" — that
// eligibility clause isn't useful to show back to the customer it's for.
function cleanDiscountSummary(summary?: string | null): string | null {
  if (!summary) return null;
  return summary.replace(/\s+For\s+.+$/i, '').trim() || null;
}

/**
 * Rewards is still being rolled out — only customers whitelisted via the
 * `custom.test_account` boolean metafield (set in Shopify admin) can see or
 * use it. Never throws — a logged-out customer or a query failure both just
 * mean "not whitelisted" rather than breaking the page.
 */
export async function isRewardsTester(
  context: LoaderFunctionArgs['context'],
): Promise<boolean> {
  try {
    const {customerAccount} = context;
    if (!(await customerAccount.isLoggedIn())) return false;

    const {data} = await customerAccount.query(CUSTOMER_ID_QUERY);
    return data?.customer?.testAccount?.value === 'true';
  } catch (error) {
    console.error('Failed to check rewards whitelist:', error);
    return false;
  }
}

/**
 * Look up the logged-in customer's own active discounts (assigned via
 * Shopify's native "Specific customers" discount eligibility). Used both by
 * the cart's discount picker and the account "My Rewards" page. Guests,
 * stores without an Admin API client configured, and customers not
 * whitelisted for rewards (see isRewardsTester) simply get no personalized
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
    if (customerData?.customer?.testAccount?.value !== 'true') return [];

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
        const label = discount.title || discount.summary || code;
        const summary = cleanDiscountSummary(discount.summary);
        // Shopify's auto-generated summary (e.g. "5% off orders over RM50")
        // — only worth showing as a subtitle when it says more than the label.
        const description = summary && summary !== label ? summary : null;
        options.push({code, label, description});
      }
      return options;
    }, []);
  } catch (error) {
    console.error('Failed to load customer vouchers:', error);
    return [];
  }
}

// Raw shape returned by the loyalty API's GET /loyalty/api/customer?email=...
// endpoint. Only the fields we actually use are declared.
type LoyaltyCustomerResponse = {
  id: number;
  email: string;
  points: number;
  tier: string;
  status_code: number;
};

/**
 * Fetches the logged-in customer's points/tier from the loyalty API. The
 * API doesn't currently expose next-tier progression, so nextTier/nextTierAt
 * stay null (RewardsSummaryCard just hides that line when they're null).
 * Never throws — a missing config, a logged-out customer, or an API failure
 * all just fall back to a zeroed summary so the page still renders normally.
 */
export async function getCustomerRewardsSummary(
  context: LoaderFunctionArgs['context'],
): Promise<RewardsSummary> {
  const fallback: RewardsSummary = {points: 0, tier: 'N/A', nextTier: null, nextTierAt: null};

  try {
    const {customerAccount, env} = context;
    const apiUrl = env.LOYALTY_API_URL;
    const apiKey = env.LOYALTY_API_KEY;

    if (!apiUrl || !apiKey || !(await customerAccount.isLoggedIn())) {
      return fallback;
    }

    const {data: customerData} = await customerAccount.query(CUSTOMER_ID_QUERY);
    const email = customerData?.customer?.emailAddress?.emailAddress;
    if (!email) return fallback;

    const response = await fetch(
      `${apiUrl}/loyalty/api/customer?email=${encodeURIComponent(email)}`,
      {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      },
    );

    if (!response.ok) {
      console.error(`Loyalty API returned ${response.status} fetching customer rewards summary`);
      return fallback;
    }

    const json = (await response.json()) as LoyaltyCustomerResponse;
    return {
      points: json.points,
      tier: json.tier,
      nextTier: null,
      nextTierAt: null,
    };
  } catch (error) {
    console.error('Failed to load customer rewards summary from loyalty API:', error);
    return fallback;
  }
}

// Raw shape returned by the loyalty API's
// GET /loyalty/api/customer/rewards?email=... endpoint.
type LoyaltyRewardItem = {
  reward_id: number;
  customer_reward_id: number | null;
  voucher_code: string | null;
  name: string;
  description: string | null;
  reward_type: string;
  points_required: number;
  reward: {
    discount_type: 'fixed' | 'percentage';
    discount_value: number | null;
    applies_to_type: string;
    eligible_products: string[];
    eligible_collections: string[];
  } | null;
  min_requirement: {
    type: string;
    min_spend: number | null;
    min_quantity: number;
  } | null;
  max_redeem: number;
  has_expiry: boolean;
  expiry_value: number | null;
  expiry_unit: string | null;
  status: string;
  is_eligible: boolean;
  assigned_date: string | null;
  // Set once the voucher has actually been redeemed — null/absent for
  // vouchers still sitting in unredeemed_rewards.
  expiry_date: string | null;
  used_date: string | null;
};

// unredeemed_rewards/redeemed_rewards are now paginated envelopes rather
// than plain arrays.
type LoyaltyRewardsPage = {
  data: LoyaltyRewardItem[];
  paging: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
};

type LoyaltyRewardsResponse = {
  customer_id: number;
  unredeemed_rewards: LoyaltyRewardsPage;
  redeemed_rewards: LoyaltyRewardsPage;
  status_code: number;
};

function mapLoyaltyReward(reward: LoyaltyRewardItem): AvailableVoucher {
  return {
    id: String(reward.reward_id),
    title: reward.name,
    description: reward.description,
    rewardType: reward.reward_type,
    pointsCost: reward.points_required,
    discountType: reward.reward?.discount_type ?? null,
    discountValue: reward.reward?.discount_value ?? null,
    minSpend: reward.min_requirement?.min_spend ?? null,
    minQuantity: reward.min_requirement?.min_quantity ?? 0,
    maxRedeem: reward.max_redeem,
    hasExpiry: reward.has_expiry,
    isEligible: reward.is_eligible,
  };
}

/**
 * Fetches the logged-in customer's claimable vouchers from the loyalty API
 * (`unredeemed_rewards`). Never throws — a missing config, a logged-out
 * customer, or an API failure all just resolve to an empty list so the page
 * still renders normally (errors are logged server-side).
 */
export async function getAvailableVouchersToClaim(
  context: LoaderFunctionArgs['context'],
): Promise<AvailableVoucher[]> {
  try {
    const {customerAccount, env} = context;
    const apiUrl = env.LOYALTY_API_URL;
    const apiKey = env.LOYALTY_API_KEY;

    if (!apiUrl || !apiKey || !(await customerAccount.isLoggedIn())) {
      return [];
    }

    const {data: customerData} = await customerAccount.query(CUSTOMER_ID_QUERY);
    const email = customerData?.customer?.emailAddress?.emailAddress;
    if (!email) return [];

    const response = await fetch(
      `${apiUrl}/loyalty/api/customer/rewards?email=${encodeURIComponent(email)}`,
      {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      },
    );

    if (!response.ok) {
      console.error(
        `Loyalty API returned ${response.status} fetching available vouchers`,
      );
      return [];
    }

    const json = (await response.json()) as LoyaltyRewardsResponse;
    return (json?.unredeemed_rewards?.data ?? []).map(mapLoyaltyReward);
  } catch (error) {
    console.error('Failed to load available vouchers from loyalty API:', error);
    return [];
  }
}

// Raw shape returned by the loyalty API's
// POST /loyalty/api/customer/rewards/redeem endpoint. On success `error` is
// absent and the customer_reward_id/voucher_code/etc fields are populated;
// on failure it's the reverse — just reward_id/success/status_code/error.
type LoyaltyRedeemResult = {
  reward_id: number;
  success: boolean;
  status_code: number;
  customer_reward_id?: number | null;
  voucher_code?: string | null;
  points_used?: number;
  assigned_date?: string | null;
  error?: string;
};

type LoyaltyRedeemResponse = {
  customer_id: number;
  points_balance: number;
  results: LoyaltyRedeemResult[];
  status_code: number;
};

export type RedeemVoucherResult = {
  success: boolean;
  error?: string;
  voucherCode?: string | null;
  pointsBalance?: number;
};

/**
 * Redeems one claimable voucher via the loyalty API
 * (POST /loyalty/api/customer/rewards/redeem). Never throws — any failure
 * (missing config, logged-out customer, network/API error) comes back as
 * `{success: false}` with a message for the caller to surface.
 */
export async function redeemVoucher(
  context: LoaderFunctionArgs['context'],
  rewardId: string,
): Promise<RedeemVoucherResult> {
  try {
    const {customerAccount, env} = context;
    const apiUrl = env.LOYALTY_API_URL;
    const apiKey = env.LOYALTY_API_KEY;

    if (!apiUrl || !apiKey || !(await customerAccount.isLoggedIn())) {
      return {success: false, error: 'You must be logged in to redeem a voucher.'};
    }

    const {data: customerData} = await customerAccount.query(CUSTOMER_ID_QUERY);
    const email = customerData?.customer?.emailAddress?.emailAddress;
    if (!email) {
      return {success: false, error: 'Could not find your account email.'};
    }

    const rewardIdNumber = Number(rewardId);
    if (!Number.isFinite(rewardIdNumber)) {
      return {success: false, error: 'Invalid voucher.'};
    }

    const response = await fetch(`${apiUrl}/loyalty/api/customer/rewards/redeem`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email, reward_ids: [rewardIdNumber]}),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error(`Loyalty API returned ${response.status} redeeming voucher ${rewardId}`);
      return {success: false, error: 'Redemption failed. Please try again.'};
    }

    const json = (await response.json()) as LoyaltyRedeemResponse;
    const result = json?.results?.find((r) => r.reward_id === rewardIdNumber) ?? json?.results?.[0];

    if (!result?.success) {
      // result.error is an internal/technical message (e.g. a raw Shopify
      // rejection) — log it for debugging, but never show it to the customer.
      console.error(`Loyalty API rejected redemption of voucher ${rewardId}:`, result);
      return {success: false, error: 'Redemption failed. Please try again.'};
    }

    return {success: true, voucherCode: result.voucher_code, pointsBalance: json.points_balance};
  } catch (error) {
    console.error('Failed to redeem voucher via loyalty API:', error);
    return {success: false, error: 'Redemption failed. Please try again.'};
  }
}
