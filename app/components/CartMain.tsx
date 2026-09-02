import {CartForm, Image, useOptimisticCart, type OptimisticCartLine} from '@shopify/hydrogen';
import {Fragment, useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {Link} from 'react-router';
import type {CartApiQueryFragment} from 'types/storefrontapi.generated';
import {useAside} from '~/components/Aside';
import {CartLineProvider} from '~/components/CartLineContext';
import {CartLineItem} from '~/components/CartLineItem';
import type {CartDiscountOption} from '~/graphql/admin/CartDiscountsQuery';
import {CartSummary} from './CartSummary';
import {Button} from './ui/button';
import {cn} from '~/lib/utils';

export type CartLayout = 'page' | 'aside';

export type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: CartLayout;
  cartDiscounts?: CartDiscountOption[];
  canUseRewards?: boolean;
};

type CartLine = OptimisticCartLine<CartApiQueryFragment>;


function findGiftLine(line: CartLine, allLines: CartLine[]): CartLine | null {
  const giftVariantId = line.attributes?.find((a) => a.key === '_free_gift_variant_id')?.value;
  if (!giftVariantId) return null;

  // Build the full set of allowed variant IDs (handles post-size-swap cases)
  const sizeOptionsRaw = line.attributes?.find((a) => a.key === '_free_gift_size_options')?.value;
  const sizeIds: string[] = sizeOptionsRaw
    ? (JSON.parse(sizeOptionsRaw) as {label: string; variantId: string}[]).map((o) => o.variantId)
    : [giftVariantId];

  return (
    allLines.find(
      (l) =>
        sizeIds.includes(l.merchandise.id) &&
        l.attributes?.some((a) => a.key === '_is_free_gift' && a.value === 'true'),
    ) ?? null
  );
}

export function CartMain({
  layout,
  cart: originalCart,
  cartDiscounts = [],
  canUseRewards = false,
}: CartMainProps) {
  const cart = useOptimisticCart(originalCart);

  const allLines = cart?.lines?.nodes ?? [];
  const mainLines = allLines.filter(
    (l) => !l.attributes?.some((a) => a.key === '_is_free_gift' && a.value === 'true'),
  );

  const linesCount = Boolean(mainLines.length);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = mainLines.length > 0;

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
                    {giftLine && <CartGiftSubItem line={giftLine} mainLine={line} />}
                  </Fragment>
                );
              })}
            </ul>
          </div>
          {cartHasItems && (
            <CartSummary
              cart={cart}
              layout={layout}
              cartDiscounts={cartDiscounts}
              canUseRewards={canUseRewards}
            />
          )}
        </div>
      </div>
    </CartLineProvider>
  );
}

function CartGiftSubItem({line, mainLine}: {line: CartLine; mainLine: CartLine}) {
  const {id, merchandise} = line;
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [pendingVariantId, setPendingVariantId] = useState<string | null>(null);

  useEffect(() => {
    setPendingVariantId(null);
  }, [merchandise.id]);

  const activeVariantId = pendingVariantId ?? merchandise.id;

  const sizeOptionsRaw = mainLine.attributes?.find((a) => a.key === '_free_gift_size_options')?.value;
  const sizeOptions: {label: string; variantId: string}[] = sizeOptionsRaw
    ? (JSON.parse(sizeOptionsRaw) as {label: string; variantId: string}[])
    : [];
  const hasSize = sizeOptions.length > 0;
  const sizeChartUrl = mainLine.attributes?.find((a) => a.key === '_free_gift_size_chart_url')?.value ?? null;

  return (
    <>
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
            {hasSize ? (
              <div className="flex items-center gap-1 mt-1 flex-wrap">
                <span className="text-xs text-gray-400 mr-1">Size:</span>
                {sizeOptions.map(({label, variantId}) => (
                  <CartForm
                    key={variantId}
                    route="/cart"
                    action={CartForm.ACTIONS.LinesUpdate}
                    inputs={{lines: [{id, merchandiseId: variantId, quantity: line.quantity}]}}
                  >
                    <button
                      type="submit"
                      onClick={() => setPendingVariantId(variantId)}
                      className={cn(
                        'text-xs w-6 h-6 border font-medium',
                        activeVariantId === variantId
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-gray-600 hover:border-gray-500',
                      )}
                    >
                      {label}
                    </button>
                  </CartForm>
                ))}
                {sizeChartUrl && (
                  <button
                    type="button"
                    onClick={() => setShowSizeChart(true)}
                    className="ml-1 text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600"
                  >
                    Size chart
                  </button>
                )}
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

      {showSizeChart && sizeChartUrl && typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowSizeChart(false)}
          >
            <div
              className="relative bg-white max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowSizeChart(false)}
                className="absolute -top-3 -right-3 bg-white rounded-full w-7 h-7 flex items-center justify-center shadow text-sm font-medium hover:bg-gray-100"
              >
                ✕
              </button>
              <img src={sizeChartUrl} alt="Size Chart" className="w-full" />
            </div>
          </div>,
          document.body,
        )}
    </>
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
