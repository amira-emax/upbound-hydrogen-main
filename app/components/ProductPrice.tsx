import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {cn} from '~/lib/utils';
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
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  className?: string;
  priceClassName?: string;
  compareAtPriceClassName?: string;
  isLoading?: boolean;
  selectedVariant?: ProductFragment['selectedOrFirstAvailableVariant'];
  selectedSellingPlan?: SellingPlanFragment | null;
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

   if (selectedSellingPlan) {
    return (
      <SellingPlanPrice
        selectedSellingPlan={selectedSellingPlan}
        selectedVariant={selectedVariant}
      />
    );
  }

  return (
    <div className={cn('product-price', className)}>
      {compareAtPrice ? (
        <div className="product-price-on-sale">
          {price ? (
            <div className={cn('text-orange typo-paragraph', priceClassName)}>
              RM
              <Money withoutCurrency data={price} className="inline" />
            </div>
          ) : null}
          <s>
            <span className={compareAtPriceClassName}>
              RM
              <Money
                withoutCurrency
                data={compareAtPrice}
                className={'inline'}
              />
            </span>
          </s>
        </div>
      ) : price ? (
        <div className={cn('typo-paragraph', priceClassName)}>
          RM
          <Money withoutCurrency data={price} className={'inline'} />
        </div>
      ) : (
        <p>&nbsp;</p>
      )}
    </div>
  );
}

type SellingPlanPrice = {
  amount: number;
  currencyCode: 'MYR';
};

/*
  Render the selected selling plan price is available
*/
function SellingPlanPrice({
  selectedSellingPlan,
  selectedVariant,
}: {
  selectedSellingPlan: SellingPlanFragment;
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  if (!selectedVariant) {
    return null;
  }

  const sellingPlanPriceAdjustments = selectedSellingPlan?.priceAdjustments;

  if (!sellingPlanPriceAdjustments?.length) {
    return selectedVariant ? <Money data={selectedVariant.price} /> : null;
  }

  const selectedVariantPrice: SellingPlanPrice = {
    amount: parseFloat(selectedVariant.price.amount),
    currencyCode: selectedVariant.price.currencyCode,
  };

  const sellingPlanPrice: SellingPlanPrice = sellingPlanPriceAdjustments.reduce(
    (acc, adjustment) => {
      switch (adjustment.adjustmentValue.__typename) {
        case 'SellingPlanFixedAmountPriceAdjustment':
          return {
            amount:
              acc.amount +
              parseFloat(adjustment.adjustmentValue.adjustmentAmount.amount),
            currencyCode: acc.currencyCode,
          };
        case 'SellingPlanFixedPriceAdjustment':
          return {
            amount: parseFloat(adjustment.adjustmentValue.price.amount),
            currencyCode: acc.currencyCode,
          };
        case 'SellingPlanPercentagePriceAdjustment':
          return {
            amount:
              acc.amount *
              (1 - adjustment.adjustmentValue.adjustmentPercentage / 100),
            currencyCode: acc.currencyCode,
          };
        default:
          return acc;
      }
    },
    selectedVariantPrice,
  );

  return (
    <div className="selling-plan-price">
      <Money
        data={{
          amount: `${sellingPlanPrice.amount}`,
          currencyCode: sellingPlanPrice.currencyCode,
        }}
      />
    </div>
  );
}
