import type { CartApiQueryFragment } from 'types/storefrontapi.generated';
import type { CartLayout } from '~/components/CartMain';
import { CartForm, Money, type OptimisticCart } from '@shopify/hydrogen';
import { useRef } from 'react';
import { FetcherWithComponents } from 'react-router';
import type { CartDiscountOption } from '~/graphql/admin/CartDiscountsQuery';
import { cn } from '~/lib/utils';
import { Button } from './ui/button';

type CartSummaryProps = {
  cart: OptimisticCart<CartApiQueryFragment | null>;
  layout: CartLayout;
  cartDiscounts?: CartDiscountOption[];
};

export function CartSummary({cart, layout, cartDiscounts = []}: CartSummaryProps) {
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
      <CartDiscounts discountCodes={cart.discountCodes} availableDiscounts={cartDiscounts} />
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
}: {
  discountCodes?: CartApiQueryFragment['discountCodes'];
  availableDiscounts?: CartDiscountOption[];
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
              <div className="cart-discount">
                <code>{code}</code>
                &nbsp;
                <button type="submit">Remove</button>
              </div>
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

      {/* Fallback: manually enter a code not in the list above */}
      <UpdateDiscountForm discountCodes={codes}>
        <div>
          <input type="text" name="discountCode" placeholder="Have another code?" />
          &nbsp;
          <button type="submit">Apply</button>
        </div>
      </UpdateDiscountForm>
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
        const submittedCode = fetcher.formData?.get('discountCode');
        const resultCodes = fetcher.data?.cart?.discountCodes as
          | CartApiQueryFragment['discountCodes']
          | undefined;
        const notApplicable =
          submittedCode === discount.code &&
          resultCodes?.some((c) => c.code === discount.code && !c.applicable);

        return (
          <div className="flex flex-col items-start">
            <button
              type="submit"
              className="text-xs px-3 py-1.5 border border-gray-300 text-gray-600 font-medium rounded-full hover:border-gray-500"
            >
              {discount.label}
            </button>
            {notApplicable && (
              <span className="text-xs text-red-500 mt-1">
                This code isn&apos;t valid for your cart right now
              </span>
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
  children: React.ReactNode;
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
