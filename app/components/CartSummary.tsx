import type { CartApiQueryFragment } from 'types/storefrontapi.generated';
import type { CartLayout } from '~/components/CartMain';
import { CartForm, Money, type OptimisticCart } from '@shopify/hydrogen';
import { Loader2 } from 'lucide-react';
import { useRef } from 'react';
import { FetcherWithComponents } from 'react-router';
import type { CartDiscountOption } from '~/graphql/admin/CartDiscountsQuery';
import { cn } from '~/lib/utils';
import { Button } from './ui/button';

// A cart mutation "warning" (e.g. DISCOUNT_CODE_NOT_HONOURED,
// DISCOUNT_NO_ENTITLED_LINE_ITEMS) or the discountCodes-level
// `applicable: false` flag (e.g. minimum spend not met) — whichever fired —
// as a message to show for the code that was just submitted.
//
// `code` is best-effort only: fetcher.formData (where the submitted code
// would normally come from) is cleared by React Router once the fetcher
// settles back to 'idle' — which happens right as the result actually needs
// rendering — so by the time we'd show this, `code` is often already gone.
// When we have it, prefer a warning that names it; otherwise fetcher.data
// itself is scoped to this one form's own last submission, so any warning
// present there is already the relevant one.
function getDiscountRejection(
  fetcher: FetcherWithComponents<any>,
  code?: string | null,
): string | null {
  const warnings = fetcher.data?.warnings as
    | {code?: string; message?: string; target?: string}[]
    | undefined;
  if (warnings?.length) {
    const matching = code
      ? warnings.find((w) => w.message?.toLowerCase().includes(code.toLowerCase()))
      : undefined;
    return (matching ?? warnings[0])?.message ?? null;
  }

  if (code) {
    const resultCodes = fetcher.data?.cart?.discountCodes as
      | CartApiQueryFragment['discountCodes']
      | undefined;
    const isInapplicable = resultCodes?.some(
      (c) => c.code === code && !c.applicable,
    );
    if (isInapplicable) return "This code isn't valid for your cart right now";
  }

  return null;
}

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
  cartDiscounts?: CartDiscountOption[];
  canUseRewards?: boolean;
};

export function CartSummary({cart, layout, cartDiscounts = [], canUseRewards = false}: CartSummaryProps) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  return (
    <div
      aria-labelledby="cart-summary"
      className={cn(className, 'border-t border-neutral-400 space-y-4')}
    >
      <dl className="flex typo-body-l justify-between">
        <dt>Subtotal:</dt>
        <dd className="flex items-center">
          <span>RM</span>
          {cart.cost?.subtotalAmount?.amount ? (
            <Money data={cart.cost?.subtotalAmount} withoutCurrency />
          ) : (
            '-'
          )}
        </dd>
      </dl>
      <CartDiscounts
        discountCodes={cart.discountCodes}
        availableDiscounts={cartDiscounts}
        canUseRewards={canUseRewards}
      />
      {/* <CartGiftCard giftCardCodes={cart.appliedGiftCards} /> */}
      <CartCheckoutActions checkoutUrl={cart.checkoutUrl} lines={cart.lines?.nodes} />
      <p className="typo-caption-responsive text-mid-grey text-center">
        Taxes and shipping calculated at checkout
      </p>
    </div>
  );
}
function CartCheckoutActions({
  checkoutUrl,
  lines,
}: {
  checkoutUrl?: string;
  lines?: CartApiQueryFragment['lines']['nodes'];
}) {
  if (!checkoutUrl) return null;

  function logCheckout() {
    console.log('[Checkout] URL:', checkoutUrl);
    console.log('[Checkout] Lines going to checkout:');
    (lines ?? []).forEach((line, i) => {
      console.log(
        `  [${i + 1}] ${line.merchandise.product.title} — ${line.merchandise.title} | qty: ${line.quantity} | id: ${line.merchandise.id}`,
      );
    });
  }

  return (
    <div>
      <a href={checkoutUrl} target="_self" onClick={logCheckout}>
        <Button size="lg" className="rounded-none w-full">
          Checkout
        </Button>
      </a>
      <br />
    </div>
  );
}

function CartDiscounts({
  discountCodes,
  availableDiscounts = [],
  canUseRewards = false,
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
  availableDiscounts?: CartDiscountOption[];
  canUseRewards?: boolean;
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({ code }) => code) || [];

  // Don't show a "pick me" chip for a code that's already applied
  const pickableDiscounts = availableDiscounts.filter(
    (discount) => !codes.includes(discount.code),
  );

  return (
    <div className="space-y-2">
      {/* Have existing discount(s), each individually removable */}
      <dl hidden={!codes.length}>
        <div>
          <dt>Discount(s)</dt>
          {codes.map((code) => (
            <UpdateDiscountForm
              key={code}
              discountCodes={codes.filter((c) => c !== code)}
            >
              {(fetcher) => {
                const isRemoving = fetcher.state !== 'idle';
                return (
                  <div className="cart-discount flex items-center gap-2">
                    <code>{code}</code>
                    <button
                      type="submit"
                      disabled={isRemoving}
                      className="inline-flex items-center gap-1 disabled:opacity-60"
                    >
                      {isRemoving && <Loader2 className="size-3 animate-spin" />}
                      {isRemoving ? 'Removing…' : 'Remove'}
                    </button>
                  </div>
                );
              }}
            </UpdateDiscountForm>
          ))}
        </div>
      </dl>

      {/* Customer's own eligible discounts — pick one to apply */}
      {pickableDiscounts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {pickableDiscounts.map((discount) => (
            <DiscountChip key={discount.code} discount={discount} appliedCodes={codes} />
          ))}
        </div>
      )}

      {/* Fallback: manually enter a code not in the list above — gated
          behind the same rewards whitelist while it's still being rolled
          out, so non-whitelisted customers can't self-apply loyalty codes. */}
      {canUseRewards && (
        <UpdateDiscountForm discountCodes={codes}>
          {(fetcher) => {
            const isApplying = fetcher.state !== 'idle';
            const submittedCode = fetcher.formData?.get('discountCode') as
              | string
              | null;
            const rejection = getDiscountRejection(fetcher, submittedCode);

            return (
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="discountCode"
                    placeholder="Have another code?"
                    disabled={isApplying}
                  />
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="inline-flex items-center gap-1 disabled:opacity-60"
                  >
                    {isApplying && <Loader2 className="size-3 animate-spin" />}
                    {isApplying ? 'Applying…' : 'Apply'}
                  </button>
                </div>
                {rejection && (
                  <span className="text-xs text-red-500 mt-1 block">
                    {rejection}
                  </span>
                )}
              </div>
            );
          }}
        </UpdateDiscountForm>
      )}
    </div>
  );
}

function DiscountChip({
  discount,
  appliedCodes,
}: {
  discount: CartDiscountOption;
  appliedCodes: string[];
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCode: discount.code,
        discountCodes: appliedCodes,
      }}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        const isApplying = fetcher.state !== 'idle';
        // This chip's own fetcher only ever submits discount.code, so any
        // result on it already belongs to that code — no need to check
        // fetcher.formData (which is cleared by the time this renders).
        const rejection = getDiscountRejection(fetcher, discount.code);

        return (
          <div className="flex flex-col items-start">
            <button
              type="submit"
              disabled={isApplying}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 font-medium rounded-full hover:border-gray-500 disabled:opacity-60"
            >
              {isApplying && <Loader2 className="size-3 animate-spin" />}
              {discount.label}
            </button>
            {rejection && (
              <span className="text-xs text-red-500 mt-1">{rejection}</span>
            )}
          </div>
        );
      }}
    </CartForm>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: (fetcher: FetcherWithComponents<any>) => React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({
  giftCardCodes,
}: {
  giftCardCodes: CartApiQueryFragment['appliedGiftCards'] | undefined;
}) {
  const appliedGiftCardCodes = useRef<string[]>([]);
  const giftCardCodeInput = useRef<HTMLInputElement>(null);
  const codes: string[] =
    giftCardCodes?.map(({ lastCharacters }) => `***${lastCharacters}`) || [];

  function saveAppliedCode(code: string) {
    const formattedCode = code.replace(/\s/g, ''); // Remove spaces
    if (!appliedGiftCardCodes.current.includes(formattedCode)) {
      appliedGiftCardCodes.current.push(formattedCode);
    }
    giftCardCodeInput.current!.value = '';
  }

  function removeAppliedCode() {
    appliedGiftCardCodes.current = [];
  }

  return (
    <div>
      {/* Have existing gift card applied, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt>Applied Gift Card(s)</dt>
          <UpdateGiftCardForm>
            <div className="cart-discount">
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button onSubmit={() => removeAppliedCode}>Remove</button>
            </div>
          </UpdateGiftCardForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateGiftCardForm
        giftCardCodes={appliedGiftCardCodes.current}
        saveAppliedCode={saveAppliedCode}
      >
        <div>
          <input
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
            ref={giftCardCodeInput}
          />
          &nbsp;
          <button type="submit">Apply</button>
        </div>
      </UpdateGiftCardForm>
    </div>
  );
}

function UpdateGiftCardForm({
  giftCardCodes,
  saveAppliedCode,
  children,
}: {
  giftCardCodes?: string[];
  saveAppliedCode?: (code: string) => void;
  removeAppliedCode?: () => void;
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesUpdate}
      inputs={{
        giftCardCodes: giftCardCodes || [],
      }}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        const code = fetcher.formData?.get('giftCardCode');
        if (code && saveAppliedCode) {
          saveAppliedCode(code as string);
        }
        return children;
      }}
    </CartForm>
  );
}
