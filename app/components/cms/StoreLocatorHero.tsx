import { Image } from '@shopify/hydrogen';
import { cn } from '~/lib/utils';
import type { StoreLocatorHeroFragment } from 'types/storefrontapi.generated';

interface StoreLocatorHeroProps {
  reference: StoreLocatorHeroFragment;
}

const POSITION_CLASSES: Record<string, string> = {
  'top-left': 'top-6 left-6 items-start text-left',
  'top-center': 'top-6 left-1/2 -translate-x-1/2 items-center text-center',
  'top-right': 'top-6 right-6 items-end text-right',
  'center-left': 'top-1/2 left-6 -translate-y-1/2 items-start text-left',
  center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center text-center',
  'center-right': 'top-1/2 right-6 -translate-y-1/2 items-end text-right',
  'bottom-left': 'bottom-6 left-6 items-start text-left',
  'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2 items-center text-center',
  'bottom-right': 'bottom-6 right-6 items-end text-right',
};

function StoreLocatorHero({ reference }: StoreLocatorHeroProps) {
  const { hero_image, hero_header, hero_text_position, hero_text_color } = reference ?? {};

  const heroImage = hero_image?.reference?.image;
  const positionClasses =
    POSITION_CLASSES[hero_text_position?.value ?? ''] ?? POSITION_CLASSES.center;
  const textColor = hero_text_color?.value ?? 'text-white';

  return (
    <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      {heroImage && (
        <div className="absolute inset-0">
          <Image
            data={heroImage}
            className="w-full h-full object-cover"
            sizes="100vw"
          />
        </div>
      )}

      {hero_header?.value && (
        <div className={cn('absolute flex flex-col max-w-lg', positionClasses)}>
          <h1 className={cn('typo-header whitespace-pre-line', textColor)}>
            {hero_header.value}
          </h1>
        </div>
      )}
    </div>
  );
}

export default StoreLocatorHero;
