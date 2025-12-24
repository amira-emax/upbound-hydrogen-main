import {Image} from '@shopify/hydrogen';
import {useEffect, useState} from 'react';
import {NavLink} from 'react-router';
import {ImageCarouselFragment} from 'types/storefrontapi.generated';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~/components/ui/carousel';
import {cn} from '~/lib/utils';
import CtaButton from '../CtaButton';
import {Button} from '../ui/button';

interface CarouselWithCtaProps {
  reference: ImageCarouselFragment;
}

function CarouselWithCta({reference}: CarouselWithCtaProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  const {title, subtitle, cta, cards, mobileLayout} = reference ?? {};
  const cardsArray = cards?.references?.nodes ?? [];
  // determine variant tru card
  const isScienceVariant = cardsArray.some(
    (card) => card?.variant?.value === 'brand-offering',
  );

  useEffect(() => {
    if (!api) {
      return;
    }

    api.reInit();

    // Update current index when slide changes
    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    // Set initial index
    setCurrentIndex(api.selectedScrollSnap());

    // Add event listener
    api.on('select', onSelect);

    // Cleanup
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  // For debugging - you can remove this
  useEffect(() => {
    console.log('Current slide index:', currentIndex);
  }, [currentIndex]);

  return (
    <div className="my-[100px] text-center space-y-4 md:space-y-8">
      {subtitle?.value && (
        <p className="typo-caption mx-auto">{subtitle?.value}</p>
      )}
      <h1 className="page-px md:whitespace-pre-line">{title?.value}</h1>
      {/* Carousel section */}
      <Carousel
        opts={{
          align: 'center',
          loop: false, // TODO: more dynamic controls
          containScroll: isScienceVariant ? false : 'keepSnaps',
          slidesToScroll: isScienceVariant ? 1 : 'auto',
          startIndex: 0,
          inViewThreshold: 0.5,
        }}
        className={cn(
          'w-full',
          mobileLayout?.value === 'carousel' ? 'block' : 'hidden md:block',
        )}
        setApi={setApi}
      >
        <CarouselContent
          className={cn(
            'ml-0 md:ml-2',
            !api?.canScrollNext() &&
              !api?.canScrollPrev() &&
              'lg:justify-center',
          )}
        >
          {cardsArray.map((card, index) => (
            <CarouselItem
              key={index}
              className={cn(
                'pr-4 basis-full md:basis-1/2 lg:basis-1/3',
                isScienceVariant && currentIndex !== index && 'opacity-40',
                !isScienceVariant && 'xl:basis-1/4',
              )}
            >
              <CarouselCard card={card} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-center items-center gap-2 mt-8">
          <CarouselPrevious className="translate-none" />
          <CtaButton
            reference={cta?.reference ?? null}
            variant="glass-default"
            size="sm"
          />
          <CarouselNext className="translate-none" />
        </div>
      </Carousel>
      {/* Grid section */}
      <div
        className={cn(
          'flex-col md:hidden gap-4 page-px',
          mobileLayout?.value === 'flex' ? 'flex' : 'hidden',
        )}
      >
        {cardsArray.map((card, index) => (
          <CarouselCard key={index} card={card} />
        ))}
      </div>
    </div>
  );
}

export function CarouselCard({card}: {card: any}) {
  switch (card.variant.value) {
    case 'community':
      return (
        <div className="relative">
          {card?.image?.reference?.image && (
            <NavLink to={card.internalUrl.value}>
              <div className="aspect-[400/520] rounded-lg overflow-clip">
                <Image
                  data={card.image.reference.image}
                  width={400}
                  height={520}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            </NavLink>
          )}
          <div
            className={cn(
              'absolute top-[10px] right-[10px] flex justify-end select-none',
            )}
          >
            {card?.tags?.value && (
              <div className="flex flex-wrap justify-end gap-2">
                {(() => {
                  try {
                    const tagsArray = JSON.parse(card.tags.value) as string[];
                    return tagsArray.map((tag: string, index: number) => (
                      <div
                        key={index}
                        className="typo-caption-responsive bg-black text-white rounded-full px-2 md:px-3 py-1"
                      >
                        {tag}
                      </div>
                    ));
                  } catch (e) {
                    // Fallback if parsing fails
                    return (
                      <div className="typo-caption-responsive bg-black text-white rounded-full px-3 py-1">
                        {card.tags.value}
                      </div>
                    );
                  }
                })()}
              </div>
            )}
          </div>

          <div className="flex mt-6 pl-[6px] gap-4">
            {card?.internalUrl?.value && (
              <NavLink to={card.internalUrl.value}>
                <Button size="sm" className="flex items-center">
                  Read About
                </Button>
              </NavLink>
            )}
            <div className="text-left">
              <p>{card?.title?.value}</p>
              {card?.description?.value && (
                <p className="text-mid-grey">{card?.description?.value}</p>
              )}
            </div>
          </div>
        </div>
      );

    case 'brand-offering':
    default:
      return (
        <>
          {/* mobile */}
          <div className="relative md:hidden">
            {card?.image?.reference?.image && (
              <div className="aspect-[400/520] rounded-lg overflow-clip">
                <Image
                  data={card.image.reference.image}
                  width={400}
                  height={520}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            )}
            <div
              className={cn(
                'absolute inset-6 flex-grow flex flex-col text-white justify-between select-none',
                card?.mixBlend?.value == 'true' && 'mix-blend-difference',
              )}
            >
              <h2 className="typo-display-l text-left">{card?.title?.value}</h2>
              {card?.description?.value && (
                <p className="whitespace-pre-line text-left">
                  {card?.description?.value}
                </p>
              )}
              {card?.internalUrl?.value && (
                <a
                  href={card.internalUrl.value}
                  className="mt-auto text-primary font-medium hover:underline"
                >
                  Learn more
                </a>
              )}
            </div>
          </div>
          {/* desktop */}
          <div className="relative hidden md:block">
            {card?.image?.reference?.image && (
              <>
                {/* desktop image */}
                <div className="hidden md:block overflow-clip">
                  <Image
                    data={card.image.reference.image}
                    aspectRatio="480/300"
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
                {/* mobile image */}
                <div className="md:hidden overflow-clip">
                  <Image
                    data={card.image.reference.image}
                    aspectRatio="400/520"
                    width={400}
                    height={520}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              </>
            )}
            <div
              className={cn(
                'absolute top-2 right-2 lg:top-6 lg:right-6 flex justify-end select-none',
              )}
            >
              {card?.tags?.value && (
                <div className="flex flex-wrap justify-end gap-2">
                  {(() => {
                    try {
                      const tagsArray = JSON.parse(card.tags.value) as string[];
                      return tagsArray.map((tag: string, index: number) => (
                        <div
                          key={index}
                          className="typo-caption-responsive bg-black text-white rounded-full px-2 md:px-3 py-1"
                        >
                          {tag}
                        </div>
                      ));
                    } catch (e) {
                      // Fallback if parsing fails
                      return (
                        <div className="typo-caption-responsive bg-black text-white rounded-full px-3 py-1">
                          {card.tags.value}
                        </div>
                      );
                    }
                  })()}
                </div>
              )}
            </div>

            <div className="flex mt-6 pl-[6px] gap-4">
              <div className="text-left">
                <p className="typo-display-l mb-4">{card?.title?.value}</p>
                {card?.description?.value && (
                  <p className="text-mid-grey">{card?.description?.value}</p>
                )}
              </div>
            </div>
          </div>
        </>
      );
  }
}

export default CarouselWithCta;
