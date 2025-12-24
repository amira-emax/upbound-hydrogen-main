import {Image} from '@shopify/hydrogen';
import type {HeroImageWithProductFragment} from 'types/storefrontapi.generated';
import {AddToCartButton} from '~/components/AddToCartButton';
import {ProductPrice} from '../ProductPrice';

interface HeroImageWithProductProps {
  reference: HeroImageWithProductFragment;
}

function HeroImageWithProduct({reference}: HeroImageWithProductProps) {
  const {title, desktopImage, mobileImage, featuredProduct} = reference ?? {};
  const product = featuredProduct?.reference;

  if (!product) return null;

  return (
    <div>
      <div className="h-dvh w-full relative justify-self-center">
        <div
          className="absolute left-[50%] -translate-x-[50%] bottom-[50%] md:bottom-[60px] translate-y-[50%] md:translate-y-0
         space-y-8"
        >
          <h1 className="text-white mix-blend-difference whitespace-pre-line">
            {title?.value}
          </h1>
          <AddToCartButton
            size="lg"
            variant="mint-black"
            disabled={
              !product?.selectedOrFirstAvailableVariant?.availableForSale
            }
            lines={
              product.selectedOrFirstAvailableVariant?.availableForSale
                ? [
                    {
                      merchandiseId:
                        product.selectedOrFirstAvailableVariant?.id,
                      quantity: 1,
                    },
                  ]
                : []
            }
            buttonClassName="rounded-none w-full"
            containerClassName="hidden md:block w-full "
          >
            <div className="flex w-full justify-between items-center">
              <p className="typo-caption-responsive">ADD TO CART</p>
              <ProductPrice
                price={product?.selectedOrFirstAvailableVariant?.price}
                className="typo-caption-responsive"
              />
            </div>
          </AddToCartButton>
        </div>
        <Image
          data={desktopImage?.reference?.image ?? undefined}
          className="hidden md:block w-full h-dvh object-cover"
          draggable={false}
          sizes="100vw"
        />
        <Image
          data={
            mobileImage?.reference?.image ??
            desktopImage?.reference?.image ??
            undefined
          }
          className="md:hidden w-full h-dvh object-cover"
          draggable={false}
          sizes="100vw"
        />
      </div>
      <AddToCartButton
        size="lg"
        variant="mint-black"
        disabled={!product?.selectedOrFirstAvailableVariant?.availableForSale}
        lines={
          product.selectedOrFirstAvailableVariant?.availableForSale
            ? [
                {
                  merchandiseId: product.selectedOrFirstAvailableVariant?.id,
                  quantity: 1,
                },
              ]
            : []
        }
        buttonClassName="rounded-none w-full"
        containerClassName="md:hidden w-full"
      >
        <div className="flex justify-between items-center w-full">
          <p className="typo-caption-responsive">ADD TO CART</p>
          <ProductPrice
            price={product?.selectedOrFirstAvailableVariant?.price}
            className="typo-caption-responsive"
          />
        </div>
      </AddToCartButton>
    </div>
  );
}

export default HeroImageWithProduct;
