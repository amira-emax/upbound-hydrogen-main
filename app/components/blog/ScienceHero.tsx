import {Image} from '@shopify/hydrogen';
import type {ScienceHeroFragment} from 'types/storefrontapi.generated';

interface ScienceHeroProps {
  data: ScienceHeroFragment;
}

export default function ScienceHero({data}: ScienceHeroProps) {
  const {title, subtitle, description, hero_image} = data;

  return (
    <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      {hero_image?.reference?.image && (
        <div className="absolute inset-0">
          <Image
            data={hero_image.reference.image}
            className="w-full h-full object-cover"
            sizes="100vw"
          />
        </div>
      )}
      <div className="absolute flex items-center bottom-6 right-6 md:right-auto md:top-[50%] md:translate-y-[-50%] md:left-[80px] text-white">
        <div className="whitespace-pre-line text-right md:text-left mix-blend-difference">
          {title?.value && <h2 className="md:mb-8">{title.value}</h2>}
          <div className="hidden md:block">
            {subtitle?.value && (
              <p className="typo-p-large mb-4">{subtitle.value}</p>
            )}
            {description?.value && <p>{description.value}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
