import {useOptimisticCart, type OptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'types/storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineProvider} from '~/components/CartLineContext';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {Button} from './ui/button';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 */
export function CartMain({layout, cart: originalCart}: CartMainProps) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;

  return (
    <CartLineProvider>
      <div className={className}>
        <CartEmpty hidden={linesCount} layout={layout} />
        <div className="cart-details">
          <div aria-labelledby="cart-lines">
            <ul>
              {(cart?.lines?.nodes ?? []).map((line) => (
                <CartLineItem key={line.id} line={line} layout={layout} />
              ))}
              <CartFreeGift cart={cart} />
            </ul>
          </div>
          {cartHasItems && <CartSummary cart={cart} layout={layout} />}
        </div>
      </div>
    </CartLineProvider>
  );
}

function CartFreeGift({
  cart,
}: {
  cart: OptimisticCart<CartApiQueryFragment | null>;
}) {
  const lines = cart?.lines?.nodes ?? [];
  if (lines.length === 0) return null;

  const hasSubscription = lines.some((line) => !!line.sellingPlanAllocation);

  let gift: {name: string; condition: string} | null = null;

  if (hasSubscription) {
    gift = {name: 'Windbreaker', condition: 'Subscribe & Save'};
  } else {
    const allValues = lines
      .flatMap((line) => [
        line.merchandise.title,
        ...line.merchandise.selectedOptions.map((o) => o.value),
      ])
      .join(' ');

    if (/\b24\b/.test(allValues)) {
      gift = {name: 'T-Shirt', condition: '24-can pack'};
    } else if (/\b6\b/.test(allValues)) {
      gift = {name: 'Tote Bag', condition: '6-can pack'};
    }
  }

  if (!gift) return null;

  return (
    <li className="flex py-4 border-b border-neutral-400 gap-4">
      <div className="shrink-0 w-20 md:w-25 aspect-square bg-gray-50 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8 text-gray-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1012 10.125a2.625 2.625 0 000-5.25zM3.375 19.5h17.25M3.375 12h17.25"
          />
        </svg>
      </div>
      <div className="flex flex-col flex-1 justify-center gap-1">
        <p className="typo-p font-medium">{gift.name}</p>
        <p className="text-xs text-gray-500">Free with your {gift.condition}</p>
        <p className="text-xs text-gray-400">Added at order confirmation</p>
      </div>
      <div className="flex items-start pt-1">
        <span className="text-xs bg-mint px-2 py-1 font-bold uppercase tracking-wide rounded-full">
          Free
        </span>
      </div>
    </li>
  );
}

function CartEmpty({
  hidden = false,
  layout,
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  const {close} = useAside();
  return (
    <div hidden={hidden} className="text-center pt-6">
      <p>You haven&apos;t added anything to cart.</p>
      <br />
      <Link to="/collections/all" onClick={close} prefetch="viewport">
        <Button size="sm">Start Shopping</Button>
      </Link>
    </div>
  );
}
