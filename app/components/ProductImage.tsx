import {Image} from '@shopify/hydrogen';
import {Image as ShopifyImage} from '@shopify/hydrogen/storefront-api-types';
import {ChevronLeft, ChevronRight, ZoomIn} from 'lucide-react';
import {motion} from 'motion/react';
import {useCallback, useEffect, useState} from 'react';
import {Controlled as ControlledZoom} from 'react-medium-image-zoom';
import type {ProductVariantFragment} from 'types/storefrontapi.generated';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from '~/components/ui/carousel';
import {Button} from './ui/button';

type ProductImageProps = {
  selectedVariantImage?: ProductVariantFragment['image'];
  mediaImages?: ShopifyImage[];
};

// Mobile Product Image component with carousel
export function MobileProductImage({
  selectedVariantImage,
  mediaImages,
}: ProductImageProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentlyRenderedImage, setCurrentlyRenderedImage] =
    useState<ShopifyImage | null>(null);
  const [hoveringIndex, setHoveringIndex] = useState<number | null>(null);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Update currentlyRenderedImage when zoomedIndex changes
  useEffect(() => {
    if (zoomedIndex !== null && mediaImages && mediaImages.length > 0) {
      setCurrentlyRenderedImage(mediaImages[zoomedIndex]);
      setCurrentImageIndex(zoomedIndex);
    } else {
      setCurrentlyRenderedImage(null);
    }
  }, [zoomedIndex, mediaImages]);

  // Handle navigation to previous image
  const handlePrevImage = useCallback(() => {
    if (mediaImages && mediaImages.length > 0) {
      const prevIndex =
        currentImageIndex > 0 ? currentImageIndex - 1 : mediaImages.length - 1;
      setCurrentlyRenderedImage(mediaImages[prevIndex]);
      setCurrentImageIndex(prevIndex);
    }
  }, [currentImageIndex]);

  // Handle navigation to next image
  const handleNextImage = useCallback(() => {
    if (mediaImages && mediaImages.length > 0) {
      const nextIndex =
        currentImageIndex < mediaImages.length - 1 ? currentImageIndex + 1 : 0;
      setCurrentlyRenderedImage(mediaImages[nextIndex]);
      setCurrentImageIndex(nextIndex);
    }
  }, [currentImageIndex]);

  const customZoomContent = useCallback(
    ({img, modalState, buttonUnzoom, onUnzoom}: any) => (
      <>
        {buttonUnzoom}
        <Button
          size="icon"
          className="absolute left-4 top-[50%] transform-y-[50%] size-8 z-10"
          onClick={handlePrevImage}
          disabled={!mediaImages || mediaImages.length <= 1}
        >
          <ChevronLeft />
        </Button>
        <Button
          size="icon"
          className="absolute right-4 top-[50%] transform-y-[50%] size-8 z-10"
          onClick={handleNextImage}
          disabled={!mediaImages || mediaImages.length <= 1}
        >
          <ChevronRight />
        </Button>
        {img}
      </>
    ),
    [handlePrevImage, handleNextImage, mediaImages],
  );

  useEffect(() => {
    if (!api) {
      return;
    }
  }, [api]);

  if (!selectedVariantImage && (!mediaImages || mediaImages.length <= 0)) {
    return null;
  }

  return (
    <div className="md:hidden mb-8">
      <Carousel
        opts={{
          align: 'center',
          loop: false,
          containScroll: false,
          slidesToScroll: 'auto',
          startIndex: 0,
        }}
        className="w-full"
        setApi={setApi}
      >
        <CarouselContent>
          {selectedVariantImage ? (
            <CarouselItem key={selectedVariantImage.id} className="basis-4/5">
              <div className="aspect-[310/430] overflow-hidden rounded-lg">
                <Image
                  alt={selectedVariantImage.altText || 'Product Image'}
                  aspectRatio="310/430"
                  data={selectedVariantImage}
                  sizes="(min-width: 45em) 50vw, 100vw"
                  className="w-full h-full object-cover"
                />
              </div>
            </CarouselItem>
          ) : (
            mediaImages?.map((image, index) => (
              <CarouselItem key={image.url || index} className="basis-4/5">
                <div
                  className="aspect-[310/430] overflow-hidden rounded-lg relative"
                  onPointerEnter={() => setHoveringIndex(index)}
                  onPointerLeave={() => setHoveringIndex(null)}
                >
                  <ControlledZoom
                    key={index}
                    isZoomed={zoomedIndex === index}
                    onZoomChange={(zoomed) => {
                      if (!zoomed) setZoomedIndex(null);
                    }}
                    ZoomContent={customZoomContent}
                  >
                    <Image
                      alt={image.altText || `Product Image ${index + 1}`}
                      aspectRatio="310/430"
                      data={currentlyRenderedImage || image}
                      sizes="(min-width: 45em) 50vw, 100vw"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </ControlledZoom>

                  <Button
                    size="icon"
                    className="absolute right-2 bottom-2 size-10"
                    disabled={hoveringIndex !== index}
                    onClick={() => setZoomedIndex(index)}
                  >
                    <ZoomIn className="size-4" />
                  </Button>
                </div>
              </CarouselItem>
            ))
          )}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

// Desktop Product Image component with flex layout
export function DesktopProductImage({
  selectedVariantImage,
  mediaImages,
}: ProductImageProps) {
  const [currentlyRenderedImage, setCurrentlyRenderedImage] =
    useState<ShopifyImage | null>(null);
  const [hoveringIndex, setHoveringIndex] = useState<number | null>(null);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Update currentlyRenderedImage when zoomedIndex changes
  useEffect(() => {
    if (zoomedIndex !== null && mediaImages && mediaImages.length > 0) {
      setCurrentlyRenderedImage(mediaImages[zoomedIndex]);
      setCurrentImageIndex(zoomedIndex);
    } else {
      setCurrentlyRenderedImage(null);
    }
  }, [zoomedIndex, mediaImages]);

  // Handle navigation to previous image
  const handlePrevImage = useCallback(() => {
    if (mediaImages && mediaImages.length > 0) {
      const prevIndex =
        currentImageIndex > 0 ? currentImageIndex - 1 : mediaImages.length - 1;
      setCurrentlyRenderedImage(mediaImages[prevIndex]);
      setCurrentImageIndex(prevIndex);
    }
  }, [currentImageIndex]);

  // Handle navigation to next image
  const handleNextImage = useCallback(() => {
    if (mediaImages && mediaImages.length > 0) {
      const nextIndex =
        currentImageIndex < mediaImages.length - 1 ? currentImageIndex + 1 : 0;
      setCurrentlyRenderedImage(mediaImages[nextIndex]);
      setCurrentImageIndex(nextIndex);
    }
  }, [currentImageIndex]);

  const customZoomContent = useCallback(
    ({img, modalState, buttonUnzoom, onUnzoom}: any) => (
      <>
        {buttonUnzoom}
        <Button
          size="icon"
          className="absolute left-4 top-[50%] transform-y-[50%] size-12"
          onClick={handlePrevImage}
          disabled={!mediaImages || mediaImages.length <= 1}
        >
          <ChevronLeft />
        </Button>
        <Button
          size="icon"
          className="absolute right-4 top-[50%] transform-y-[50%] size-12"
          onClick={handleNextImage}
          disabled={!mediaImages || mediaImages.length <= 1}
        >
          <ChevronRight />
        </Button>
        {img}
      </>
    ),
    [handlePrevImage, handleNextImage, mediaImages],
  );

  if (!selectedVariantImage && (!mediaImages || mediaImages.length <= 0)) {
    return null;
  }

  return (
    <div className="hidden md:block col-span-6">
      {!selectedVariantImage ? (
        !mediaImages || mediaImages.length <= 0 ? (
          <div />
        ) : (
          <div className="flex flex-col gap-4">
            {mediaImages.map((image, index) => (
              <div
                key={image.url || index}
                className="relative overflow-hidden rounded-lg"
                onPointerEnter={() => setHoveringIndex(index)}
                onPointerLeave={() => setHoveringIndex(null)}
              >
                <ControlledZoom
                  isZoomed={zoomedIndex === index}
                  onZoomChange={(zoomed) => {
                    if (!zoomed) setZoomedIndex(null);
                  }}
                  zoomMargin={64}
                  ZoomContent={customZoomContent}
                >
                  <Image
                    alt={image.altText || `Product Image ${index + 1}`}
                    aspectRatio="3/4"
                    data={currentlyRenderedImage || image}
                    sizes="(min-width: 45em) 50vw, 100vw"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </ControlledZoom>

                <motion.div
                  initial={{opacity: 0}}
                  animate={{opacity: hoveringIndex === index ? 1 : 0}}
                  transition={{duration: 0.3}}
                >
                  <Button
                    size="icon"
                    className="absolute right-2 bottom-2 size-12"
                    disabled={hoveringIndex !== index}
                    onClick={() => setZoomedIndex(index)}
                  >
                    <ZoomIn />
                  </Button>
                </motion.div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="overflow-hidden rounded-lg">
          <Image
            alt={selectedVariantImage.altText || 'Product Image'}
            aspectRatio="3/4"
            data={selectedVariantImage}
            key={selectedVariantImage.id}
            sizes="(min-width: 45em) 50vw, 100vw"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
