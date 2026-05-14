import {CartForm, Image, useOptimisticCart, type OptimisticCartLine} from '@shopify/hydrogen';
import {Fragment} from 'react';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'types/storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineProvider} from '~/components/CartLineContext';
import {CartLineItem, GIFT_VARIANT_IDS} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {Button} from './ui/button';
import {cn} from '~/lib/utils';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
};

const TSHIRT_SIZES = [
  {label: 'S', variantId: 'gid://shopify/ProductVariant/49641234399425'},
  {label: 'M', variantId: 'gid://shopify/ProductVariant/49641234432193'},
  {label: 'L', variantId: 'gid://shopify/ProductVariant/49641234464961'},
] as const;

const TSHIRT_VARIANT_IDS = new Set(TSHIRT_SIZES.map((s) => s.variantId));

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

function findGiftLine(line: CartLine, allLines: CartLine[]): CartLine | null {
  if (line.sellingPlanAllocation) {
    return allLines.find((l) => l.merchandise.id === 'gid://shopify/ProductVariant/50182544818369') ?? null;
  }
  const allValues = [
    line.merchandise.title,
    ...line.merchandise.selectedOptions.map((o) => o.value),
  ].join(' ');
  if (/\b24s?\b/i.test(allValues)) {
    return allLines.find((l) => TSHIRT_VARIANT_IDS.has(l.merchandise.id as any)) ?? null;
  }
  if (/\b6s?\b/i.test(allValues)) {
    return allLines.find((l) => l.merchandise.id === 'gid://shopify/ProductVariant/50182545703105') ?? null;
  }
  return null;
}

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

  return (
    <CartLineProvider>
      <div className={className}>
        <CartEmpty hidden={linesCount} layout={layout} />
        <div className="cart-details">
          <div aria-labelledby="cart-lines">
            <ul>
              {mainLines.map((line) => {
                const giftLine = findGiftLine(line, allLines);
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

function CartGiftSubItem({line}: {line: CartLine}) {
  const {id, merchandise} = line;
  const isTShirt = TSHIRT_VARIANT_IDS.has(merchandise.id as any);

  return (
    <li className="flex items-center gap-3 py-3 px-3 ml-6 border-b border-neutral-400 bg-gray-50">
      <div className="flex-1 flex items-center gap-3">
        <div className="shrink-0 w-12 h-12 bg-gray-100 flex items-center justify-center overflow-hidden">
          {merchandise.image ? (
            <Image
              data={merchandise.image}
              alt={merchandise.product.title}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-gray-400"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1012 10.125a2.625 2.625 0 000-5.25zM4.875 9.375A2.625 2.625 0 107.5 12H4.875A2.625 2.625 0 002.25 9.375zm14.25 0A2.625 2.625 0 1019.125 12H16.5a2.625 2.625 0 00-2.625-2.625z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25M3.375 12h17.25" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-sm font-medium">{merchandise.product.title}</p>
          {isTShirt ? (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-gray-400 mr-1">Size:</span>
              {TSHIRT_SIZES.map(({label, variantId}) => (
                <CartForm
                  key={variantId}
                  route="/cart"
                  action={CartForm.ACTIONS.LinesUpdate}
                  inputs={{lines: [{id, merchandiseId: variantId, quantity: 1}]}}
                >
                  <button
                    type="submit"
                    className={cn(
                      'text-xs w-6 h-6 border font-medium',
                      merchandise.id === variantId
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 text-gray-600 hover:border-gray-500',
                    )}
                  >
                    {label}
                  </button>
                </CartForm>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Included in your order</p>
          )}
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
