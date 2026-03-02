import { Money } from '@shopify/hydrogen';
import type { MoneyV2 } from '@shopify/hydrogen/storefront-api-types';
import { cn } from '~/lib/utils';
import type { ProductFragment, SellingPlanFragment } from 'types/storefrontapi.generated';

export function ProductPrice({
  price,
  compareAtPrice,
  className,
  priceClassName,
  compareAtPriceClassName,
  isLoading = false,
  selectedSellingPlan,
  selectedVariant,
  purchaseType, // 👇 ADDED THIS PROP
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  className?: string;
  priceClassName?: string;
  compareAtPriceClassName?: string;
  isLoading?: boolean;
  selectedVariant?: ProductFragment['selectedOrFirstAvailableVariant'];
  selectedSellingPlan?: SellingPlanFragment | null;
  purchaseType?: 'one-time' | 'subscription'; // 👇 ADDED THIS TYPE
}) {
  if (isLoading) {
    return (
      <div className={cn('product-price', className)}>
        <div
          className={cn(
            'animate-pulse bg-gray-200 h-5 w-20 rounded',
            priceClassName,
          )}
        />
      </div>
    );
  }

  // 1. Safely extract the pre-calculated subscription price from Shopify
  const subPrice = selectedVariant?.sellingPlanAllocations?.nodes?.[0]?.priceAdjustments?.[0]?.price;

  // 2. Determine if we should show the subscription price
  // It only triggers if "Subscribe" is selected AND a subscription actually exists for this variant
  const isSubscriptionActive = purchaseType === 'subscription' && subPrice;

  // 3. Swap the prices dynamically
  const activePrice = isSubscriptionActive ? subPrice : price;
  const activeCompareAtPrice = isSubscriptionActive ? price : compareAtPrice;

  let discountPercent = 0;
  if (activePrice && activeCompareAtPrice) {
    const original = parseFloat(activeCompareAtPrice.amount);
    const current = parseFloat(activePrice.amount);

    if (original > current) {
      discountPercent = Math.round(((original - current) / original) * 100);
    }
  }

  return (
    <div className={cn('product-price', className)}>
      {activeCompareAtPrice ? (
        <div className="product-price-on-sale flex items-center gap-2">

          <s>
            <span className={cn('text-gray-400', compareAtPriceClassName)}>
              RM
              <Money
                withoutCurrency
                data={activeCompareAtPrice}
                className={'inline'}
              />
            </span>
          </s>
          {activePrice ? (
            <div className={cn('text-secondary-green typo-header flex items-center gap-3')}>
              <div>
                RM <Money withoutCurrency data={activePrice} className="inline" />
              </div>

              {/* 👇 Conditionally render the dynamic badge */}
              {discountPercent > 0 && (
                <span className="bg-red-500 text-white px-3 py-0.5 rounded-full text-[15px] uppercase">
                  Save {discountPercent}%
                </span>
              )}
            </div>
          ) : null}
        </div>
      ) : activePrice ? (
        <div className={cn('typo-paragraph', priceClassName)}>
          RM
          <Money withoutCurrency data={activePrice} className={'inline'} />
        </div>
      ) : (
        <p>&nbsp;</p>
      )}
    </div>
  );
}
