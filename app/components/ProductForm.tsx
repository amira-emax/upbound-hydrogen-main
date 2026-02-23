import { type MappedProductOptions } from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import { Link, useNavigate } from 'react-router';
import type { ProductFragment, SellingPlanFragment } from 'types/storefrontapi.generated';
import { AddToCartButton } from './AddToCartButton';
import { useAside } from './Aside';
import { ProductQuantityControl } from './ProductQuantityControl';
import { Button } from './ui/button';
import { cn } from '~/lib/utils';
import { useState, useEffect  } from 'react';
import {
  SellingPlanSelector,
  type SellingPlanGroup,
} from '~/components/SellingPlanSelector';

export function ProductForm({
  productOptions,
  selectedVariant,
  sellingPlanGroups,
  selectedSellingPlan,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
  selectedSellingPlan: SellingPlanFragment | null;
  sellingPlanGroups: ProductFragment['sellingPlanGroups'];
}) {
  const navigate = useNavigate();
  const { open } = useAside();

  const [quantity, setQuantity] = useState(1);
  const [purchaseType, setPurchaseType] = useState<'one-time' | 'subscription'>('one-time');

  const hasSubscription = selectedVariant?.sellingPlanAllocations?.nodes?.length > 0;

useEffect(() => {
  if (!hasSubscription) {
    setPurchaseType('one-time');
  }
}, [hasSubscription]);

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
          disabled={
            !selectedVariant ||
            !selectedVariant.availableForSale ||
            (purchaseType === 'subscription' && !selectedSellingPlan)
          }
          lines={
            selectedVariant
              ? [
                {
                  merchandiseId: selectedVariant.id,
                  quantity,
                  ...(purchaseType === 'subscription' &&
                    selectedSellingPlan && {
                    sellingPlanId: selectedSellingPlan.id,
                  }),
                },
              ]
              : []
          }
          buttonClassName="rounded-none w-full"
          containerClassName="flex-1"
        >
          {selectedVariant?.availableForSale
            ? purchaseType === 'subscription'
              ? 'Subscribe'
              : 'Add to cart'
            : 'Sold out'}
        </AddToCartButton>
      </div>

      <div>
         {selectedVariant?.availableForSale && hasSubscription && sellingPlanGroups.nodes.length > 0 && (
          <div className="mt-6 border-t pt-6">
            <p className="typo-caption-responsive-uppercase pb-4">
              Purchase Options
            </p>

            <div className="flex flex-col gap-4">

              {/* ONE TIME CARD */}
              <div
                onClick={() => setPurchaseType('one-time')}
                className={cn(
                  'border p-4 cursor-pointer transition-all',
                  purchaseType === 'one-time'
                    ? 'border-black'
                    : 'border-gray-200'
                )}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={purchaseType === 'one-time'}
                    readOnly
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      One-time purchase
                    </span>
                    <span className="text-sm text-gray-500">
                      Pay once. No commitment.
                    </span>
                  </div>
                </div>
              </div>

              {/* SUBSCRIPTION CARD */}
              <div
                onClick={() => setPurchaseType('subscription')}
                className={cn(
                  'border p-4 cursor-pointer transition-all',
                  purchaseType === 'subscription'
                    ? 'border-black'
                    : 'border-gray-200'
                )}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={purchaseType === 'subscription'}
                    readOnly
                  />
                  <div className="flex flex-col w-full">
                    <span className="font-medium">
                      Subscribe
                    </span>
                    <span className="text-sm text-gray-500">
                      Auto-delivery. Cancel anytime.
                    </span>

                    {/* Keep space consistent */}
                    <div className="mt-3">
                      {purchaseType === 'subscription' ? (
                        <SellingPlanSelector
                          sellingPlanGroups={sellingPlanGroups}
                          selectedSellingPlan={selectedSellingPlan}
                          selectedVariant={selectedVariant}
                        >
                          {({ sellingPlanGroup }) => (
                            <SellingPlanGroup
                              key={sellingPlanGroup.name}
                              sellingPlanGroup={sellingPlanGroup}
                            />
                          )}
                        </SellingPlanSelector>
                      ) : (
                        <div className="h-10" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
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

// Update as you see fit to match your design and requirements
function SellingPlanGroup({
  sellingPlanGroup,
}: {
  sellingPlanGroup: SellingPlanGroup;
}) {
  return (
  <div className="selling-plan-group" key={sellingPlanGroup.name}>
    <p className="selling-plan-group-title">
      {sellingPlanGroup.name}
    </p>

    <div className="selling-plan-options">
      {sellingPlanGroup.sellingPlans.nodes.map((sellingPlan) => {
        return (
          <Link
            key={sellingPlan.id}
            prefetch="intent"
            to={sellingPlan.url}
            preventScrollReset
            replace
            className={`selling-plan-card ${
              sellingPlan.isSelected ? 'selected' : ''
            }`}
          >
            <span className="plan-text">
              {sellingPlan.options.map((option) => option.value).join(' ')}
            </span>
          </Link>
        );
      })}
    </div>
  </div>
);
}
