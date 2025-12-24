import {Image, Money} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {
  CollectionItemFragment,
  ProductItemFragment,
} from 'types/storefrontapi.generated';
import {cn} from '~/lib/utils';
import {useVariantUrl} from '~/lib/variants';
import {AddToCartButton} from './AddToCartButton';

export function ProductItem({
  product,
  loading,
}: {
  product: CollectionItemFragment | ProductItemFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const compareAtPrice = parseFloat(
    product.compareAtPriceRange?.minVariantPrice?.amount ?? '0',
  );
  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const hasDiscount = compareAtPrice > price;
  const discountPercentage = parseFloat(
    (((compareAtPrice - price) / compareAtPrice) * 100).toFixed(0),
  );
  const soldOut = !product?.selectedOrFirstAvailableVariant?.availableForSale;

  return (
    <div className="product-item flex flex-col gap-5 text-center max-w-[400px]">
      <Link
        className="flex-1"
        key={product.id}
        prefetch="intent"
        to={variantUrl}
      >
        <div className="space-y-4">
          {image && (
            <div className="relative rounded-3xl overflow-clip">
              <Image
                alt={image.altText || product.title}
                aspectRatio="400/520"
                data={image}
                loading={loading}
                sizes="(min-width: 45em) 400px, 100vw"
              />
              {/* discount / bestseller / sold out */}
              <div className="absolute top-6 right-6">
                {soldOut ? (
                  <p className="typo-body-l text-neutral">Sold Out</p>
                ) : hasDiscount ? (
                  <p className="typo-body-l text-orange">
                    {discountPercentage}% Off
                  </p>
                ) : (
                  // <></>
                  // TODO: decide how to determine bestseller
                  <p className="typo-body-l text-secondary-green">Bestseller</p>
                )}
              </div>
            </div>
          )}
          <div className="space-y-2 flex-1">
            <p className="typo-body-l">{product.title}</p>
            <p className="text-mid-grey">{product.productType}</p>
            <div className="flex justify-center gap-3">
              {hasDiscount && (
                <h3 className="typo-body-l line-through">
                  RM
                  <Money
                    data={product.compareAtPriceRange.minVariantPrice}
                    withoutCurrency
                    className="inline"
                  />
                </h3>
              )}
              <h3 className={cn('typo-body-l', hasDiscount && 'text-orange')}>
                RM
                <Money
                  data={product.priceRange.minVariantPrice}
                  withoutCurrency
                  className="inline"
                />
              </h3>
            </div>
          </div>
        </div>
      </Link>
      <AddToCartButton
        size="sm"
        disabled={soldOut}
        lines={
          soldOut
            ? []
            : [
                {
                  merchandiseId:
                    product?.selectedOrFirstAvailableVariant?.id ?? '',
                  quantity: 1,
                },
              ]
        }
      >
        {soldOut ? 'Sold Out' : 'Add to cart'}
      </AddToCartButton>
    </div>
  );
}
