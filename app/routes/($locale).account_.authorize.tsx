import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

export async function loader({context}: LoaderFunctionArgs) {
  const result = await context.customerAccount.authorize();

  // Sync the cart's buyer identity to the now-logged-in customer. Hydrogen
  // only auto-attaches buyer identity when a cart is first CREATED — an
  // existing cart (e.g. items added as a guest before logging in) is never
  // re-linked on its own. Without this, Shopify has no way to validate
  // "Specific customers" discount eligibility against this cart, and
  // rejects any such code with a DISCOUNT_CODE_NOT_HONOURED warning even
  // though the code is genuinely valid for this customer. Never allowed to
  // break login — a failed/no-op sync here just means rewards codes won't
  // apply until the next successful sync, not a broken sign-in.
  try {
    await context.cart.updateBuyerIdentity({});
  } catch (error) {
    console.error('Failed to sync cart buyer identity after login:', error);
  }

  return result;
}
