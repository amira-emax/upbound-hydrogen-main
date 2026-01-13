import { Image } from '@shopify/hydrogen';
import type { HeroFeaturedProductFragment } from 'types/storefrontapi.generated';
import { AddToCartButton } from '~/components/AddToCartButton';

interface HeroFeaturedProductProps {
  reference: HeroFeaturedProductFragment;
}

function HeroFeaturedProduct({ reference }: HeroFeaturedProductProps) {
  const platformLogos = reference?.platformLogos?.references?.nodes || [];
  const product = reference?.featuredProduct?.reference;
  const { desktopImage, mobileImage, title } = reference ?? {};

  if (!product) return null;

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-black via-neutral to-background">
      <div className="mx-auto flex flex-col py-16 lg:py-24">
        {/* Top section with platform logos */}
        <div className="mb-12 lg:mb-24 px-4 md:px-8">
          {title ? (
            <h1 className="text-neutral text-center whitespace-pre-line mix-blend-difference">
              {title?.value}
            </h1>
          ) : (
            <>
              <p className="text-center text-white mix-blend-difference mb-8 typo-caption">
                Featured In
              </p>
              <div className="flex justify-center items-center gap-8 lg:gap-16 flex-wrap">
                {platformLogos.map(
                  (logo, index) =>
                    logo.image && (
                      <div key={index} className="w-24 lg:w-32 h-auto">
                        <Image
                          data={{
                            altText: logo.image.altText || 'Platform logo',
                            url: logo.image.url || '',
                            width: logo.image.width || 0,
                            height: logo.image.height || 0,
                          }}
                          alt={logo.image.altText || 'Platform logo'}
                          sizes="20vw"
                          className="w-full h-auto object-contain"
                        />
                      </div>
                    ),
                )}
              </div>
            </>
          )}
        </div>

        {/* Bottom section with product */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-16 items-center mt-auto">
          {/* Product image */}
          <div className="relative">
            {(desktopImage?.reference?.image || product.featuredImage) && (
              <Image
                data={{
                  altText:
                    desktopImage?.reference?.image?.altText ||
                    product.featuredImage?.altText ||
                    product.title,
                  url:
                    desktopImage?.reference?.image?.url ||
                    product.featuredImage?.url ||
                    '',
                  width:
                    desktopImage?.reference?.image?.width ||
                    product.featuredImage?.width ||
                    0,
                  height:
                    desktopImage?.reference?.image?.height ||
                    product.featuredImage?.height ||
                    0,
                  id: product.featuredImage?.id || '',
                }}
                alt={
                  desktopImage?.reference?.image?.altText ||
                  product.featuredImage?.altText ||
                  product.title
                }
                className="w-full rounded-xl md:rounded-none px-4 md:px-0 aspect-square md:aspect-auto md:h-[800px] object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            )}
          </div>

          {/* Product details */}
          <div className="flex flex-col justify-center items-stretch md:items-center lg:items-start space-y-4 md:space-y-6 p-4 lg:p-8">
            <p className="typo-caption text-mint">BRAND NEW</p>
            <h1 className="text-white mix-blend-difference">{product.title}</h1>

            <p className="typo-p-large text-neutral-200 mix-blend-difference">
              {product.description}
            </p>

            <AddToCartButton
              size="lg"
              variant="black-mint"
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
              buttonClassName="rounded-none w-full md:w-fit"
              productData={product}
              quantity={1}
              page="Hero Featured Product"
            >
              ADD TO CART
            </AddToCartButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroFeaturedProduct;
