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

  return (
    <div className={cn('product-price', className)}>
      {activeCompareAtPrice ? (
        <div className="product-price-on-sale flex items-center gap-2">
          {activePrice ? (
            <div className={cn('text-orange typo-paragraph', priceClassName)}>
              RM
              <Money withoutCurrency data={activePrice} className="inline" />
            </div>
          ) : null}
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
