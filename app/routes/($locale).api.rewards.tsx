import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {
  getCustomerVouchers,
  getRewardsCustomer,
  isRewardsEligible,
} from '~/lib/rewards';

/**
 * Resource route for the cart's rewards data (available discount vouchers +
 * whether the customer can use the manual code entry). Deliberately kept
 * OUT of root's loader and fetched lazily on the client via useFetcher() —
 * root is always-mounted and matched by every mutation's revalidation
 * (add to cart, login, etc.), and having these two extra deferred fields
 * there was found to break the mutating fetcher's own state lifecycle
 * (its `state` never returned to 'idle' even though the request completed
 * successfully), leaving the cart UI stuck on a loading spinner forever.
 * Loading this data through its own independent fetcher sidesteps that
 * entirely.
 */
export async function loader({context}: LoaderFunctionArgs) {
  const rewardsCustomer = await getRewardsCustomer(context);

  // Hydrogen only auto-attaches buyer identity when a cart is first
  // CREATED — an existing cart (e.g. items added as a guest before logging
  // in, or a session that logged in before this sync existed) is never
  // re-linked on its own. Without it, Shopify can't validate "Specific
  // customers" discount eligibility against this cart and rejects any such
  // code with DISCOUNT_CODE_NOT_HONOURED even when it's genuinely valid for
  // this customer. Re-synced on every rewards fetch (idempotent, cheap) so
  // an already-logged-in session self-heals without needing a fresh login.
  if (rewardsCustomer) {
    try {
      await context.cart.updateBuyerIdentity({});
    } catch (error) {
      console.error('Failed to sync cart buyer identity:', error);
    }
  }

  const [canUseRewards, cartDiscounts] = await Promise.all([
    isRewardsEligible(context, rewardsCustomer),
    getCustomerVouchers(context, rewardsCustomer),
  ]);

  return {cartDiscounts, canUseRewards};
}
