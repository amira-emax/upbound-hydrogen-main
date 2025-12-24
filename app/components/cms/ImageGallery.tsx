import {Image} from '@shopify/hydrogen';
import {Image as ShopifyImageType} from '@shopify/hydrogen/storefront-api-types';
import {cn} from '~/lib/utils';

interface ImageGalleryProps {
  gallery?: {
    id: string;
    type: string;
    shape: {value: string};
    desktopImage: {
      reference: {
        image: ShopifyImageType;
      };
    };
    mobileImage?: {
      reference: {
        image: ShopifyImageType;
      };
    };
  }[];
}

export default function ImageGallery({gallery}: ImageGalleryProps) {
  // Return null if gallery is undefined or empty
  if (!gallery || gallery.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 my-8">
      {gallery.map((item, index) => {
        const shape = (item.shape?.value || '').toLowerCase();
        const desktopImage = item.desktopImage?.reference?.image;
        const mobileImage = item.mobileImage?.reference?.image;

        return (
          <div
            key={item.id || index}
            className={cn(
              'overflow-hidden w-full',
              shape === 'oval' &&
                'md:w-[40%] rounded-full aspect-square md:aspect-[2/1] h-fit',
              shape === 'square' && 'md:w-[40%] aspect-square rounded-[156px]',
              shape === 'rectangle' &&
                'md:w-[60%] aspect-[350/450] md:aspect-[5/4] rounded-xl',
              !shape && 'rounded-lg',
            )}
          >
            {/* Desktop image */}
            {desktopImage && (
              <Image
                data={desktopImage}
                className={cn('hidden md:block w-full h-full object-cover')}
                sizes="(min-width: 45em) 35vw, 100vw"
                width={desktopImage.width || 800}
                height={desktopImage.height || 800}
                loading="lazy"
              />
            )}

            {/* Mobile image (fallback to desktop if not available) */}
            {(mobileImage || desktopImage) && (
              <Image
                data={mobileImage || desktopImage}
                className={cn('md:hidden w-full h-full object-cover')}
                sizes="(min-width: 45em) 50vw, 100vw"
                width={(mobileImage || desktopImage)?.width || 400}
                height={(mobileImage || desktopImage)?.height || 400}
                loading="lazy"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
