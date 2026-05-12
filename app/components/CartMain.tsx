import {useOptimisticCart, type OptimisticCartLine} from '@shopify/hydrogen';
import {Fragment} from 'react';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'types/storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineProvider} from '~/components/CartLineContext';
import {CartLineItem, GIFT_VARIANT_IDS} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {Button} from './ui/button';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

export function CartMain({layout, cart: originalCart}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;

  const allLines = cart?.lines?.nodes ?? [];
  const mainLines = allLines.filter((l) => !GIFT_VARIANT_IDS.has(l.merchandise.id));

  // Build a lookup: giftVariantId → gift cart line
  const giftByVariantId = new Map(
    allLines
      .filter((l) => GIFT_VARIANT_IDS.has(l.merchandise.id))
      .map((l) => [l.merchandise.id, l]),
  );

  // Determine which gift variantId a main line qualifies for
  function giftVariantForLine(line: CartLine): string | null {
    if (line.sellingPlanAllocation) return 'gid://shopify/ProductVariant/50182544818369';
    const allValues = [
      line.merchandise.title,
      ...line.merchandise.selectedOptions.map((o) => o.value),
    ].join(' ');
    if (/\b24s?\b/i.test(allValues)) return 'gid://shopify/ProductVariant/49641234399425';
    if (/\b6s?\b/i.test(allValues)) return 'gid://shopify/ProductVariant/50182545703105';
    return null;
  }

  return (
    <CartLineProvider>
      <div className={className}>
        <CartEmpty hidden={linesCount} layout={layout} />
        <div className="cart-details">
          <div aria-labelledby="cart-lines">
            <ul>
              {mainLines.map((line) => {
                const giftVariantId = giftVariantForLine(line);
                const giftLine = giftVariantId ? giftByVariantId.get(giftVariantId) : null;
                return (
                  <Fragment key={line.id}>
                    <CartLineItem line={line} layout={layout} giftLineId={giftLine?.id} />
                    {giftLine && <CartGiftSubItem line={giftLine} />}
                  </Fragment>
                );
              })}
            </ul>
          </div>
          {cartHasItems && <CartSummary cart={cart} layout={layout} />}
        </div>
      </div>
    </CartLineProvider>
  );
}

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

function CartGiftSubItem({line}: {line: CartLine}) {
  const {merchandise} = line;

  return (
    <li className="flex items-center gap-3 py-3 px-3 ml-6 border-b border-neutral-400 bg-gray-50">
      <div className="flex-1 flex items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4 text-gray-400 shrink-0"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1012 10.125a2.625 2.625 0 000-5.25zM4.875 9.375A2.625 2.625 0 107.5 12H4.875A2.625 2.625 0 002.25 9.375zm14.25 0A2.625 2.625 0 1019.125 12H16.5a2.625 2.625 0 00-2.625-2.625z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25M3.375 12h17.25" />
        </svg>
        <div>
          <p className="text-sm font-medium">{merchandise.product.title}</p>
          <p className="text-xs text-gray-400">Included in your order</p>
        </div>
      </div>
      <span className="text-xs bg-mint px-2 py-1 font-bold uppercase tracking-wide rounded-full shrink-0">
        Free
      </span>
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
