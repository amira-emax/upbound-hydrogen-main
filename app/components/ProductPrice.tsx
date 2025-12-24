import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';
import {cn} from '~/lib/utils';

export function ProductPrice({
  price,
  compareAtPrice,
  className,
  priceClassName,
  compareAtPriceClassName,
  isLoading = false,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  className?: string;
  priceClassName?: string;
  compareAtPriceClassName?: string;
  isLoading?: boolean;
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
