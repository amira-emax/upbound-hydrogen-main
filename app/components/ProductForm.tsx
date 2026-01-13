import { type MappedProductOptions } from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import { Link, useNavigate } from 'react-router';
import type { ProductFragment } from 'types/storefrontapi.generated';
import { AddToCartButton } from './AddToCartButton';
import { useAside } from './Aside';
import { ProductQuantityControl } from './ProductQuantityControl';
import { Button } from './ui/button';
import { cn } from '~/lib/utils';
import { useState } from 'react';

export function ProductForm({
  productOptions,
  selectedVariant,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const navigate = useNavigate();
  const { open } = useAside();

  const [quantity, setQuantity] = useState(1);

  return (
    <div className="product-form">
      {productOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
        if (option.optionValues.length === 1) return null;

        return (
          <div className="product-options" key={option.name}>
            <p className="typo-caption-responsive-uppercase pb-3">
              {option.name}
            </p>
            <div className="product-options-grid">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                if (isDifferentProduct) {
                  // SEO
                  // When the variant is a combined listing child product
                  // that leads to a different url, we need to render it
                  // as an anchor tag
                  return (
                    <Link
                      className="product-options-item"
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      style={{
                        border: selected
                          ? '1px solid black'
                          : '1px solid transparent',
                        opacity: available ? 1 : 0.3,
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                } else {
                  // SEO
                  // When the variant is an update to the search param,
                  // render it as a button with javascript navigating to
                  // the variant so that SEO bots do not index these as
                  // duplicated links
                  return (
                    <Button
                      variant="default"
                      type="button"
                      className={cn(
                        'rounded-none',
                        selected ? 'border border-black' : 'border-none',
                        available ? 'opacity-100' : 'opacity-30',
                      )}
                      key={option.name + name}
                      disabled={!exists}
                      onClick={() => {
                        if (!selected) {
                          navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Button>
                  );
                }
              })}
            </div>
            <br />
          </div>
        );
      })}

      <div className="flex flex-col flex-wrap lg:flex-row gap-4">
        <ProductQuantityControl
          quantity={quantity}
          onQuantityChange={setQuantity}
          className="flex-1"
        />

        <AddToCartButton
          variant="mint-black"
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          lines={
            selectedVariant
              ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity: quantity,
                  selectedVariant,
                },
              ]
              : []
          }

          buttonClassName="rounded-none w-full"
          containerClassName="flex-1"
          productData={selectedVariant}
          quantity={quantity}
          page="Product Page"
        >
          {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
        </AddToCartButton>
      </div>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="product-option-label-swatch"
      style={{
        backgroundColor: color || 'transparent',
      }}
    >
      {!!image && <img src={image} alt={name} />}
    </div>
  );
}
