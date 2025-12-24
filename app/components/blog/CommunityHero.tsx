import {Image} from '@shopify/hydrogen';
import type {CommunityHeroFragment} from 'types/storefrontapi.generated';

interface CommunityHeroProps {
  data: CommunityHeroFragment;
}

export default function CommunityHero({data}: CommunityHeroProps) {
  const {title, description, hero_image} = data;

  return (
    <div>
      <h2 className="text-center mb-6">{title?.value}</h2>
      <div className="w-full aspect-[350/556] md:aspect-[1400/600] rounded-xl overflow-clip mb-6 md:mb-[64px]">
        <Image
          data={hero_image?.reference?.image ?? undefined}
          className="w-full h-full object-cover object-top"
          sizes="(min-width: 1024px) 1024px, 100vw"
        />
      </div>
      <div className="max-w-content">
        {description?.value && <h1>{description.value}</h1>}
      </div>
    </div>
  );
}
