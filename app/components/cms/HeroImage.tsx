import {Image} from '@shopify/hydrogen';
import {Image as ImageType} from '@shopify/hydrogen/storefront-api-types';

interface HeroImageProps {
  title: string;
  desktopImage?: ImageType;
  mobileImage?: ImageType;
}

export default function HeroImage({
  title,
  desktopImage,
  mobileImage,
}: HeroImageProps) {
  return (
    <div className="my-[60px]">
      <h2 className="text-center mb-6">{title}</h2>
      <div className="w-full aspect-[350/556] md:aspect-[1400/600] rounded-xl overflow-clip">
        <Image
          data={desktopImage}
          className="hidden md:block w-full h-full object-cover object-top"
          sizes="(min-width: 1024px) 1024px, 100vw"
        />
        <Image
          data={mobileImage}
          className="md:hidden w-full h-full object-cover object-top"
          sizes="(min-width: 1024px) 1024px, 100vw"
        />
      </div>
    </div>
  );
}
