import HeroWithCta from './HeroWithCta';
import TextWithCta from './TextWithCta';
import CarouselWithCta from './CarouselWithCta';
import HeroAccordion from './HeroAccordion';
import HeroFeaturedProduct from './HeroFeaturedProduct';
import HeroImageMultiText from './HeroImageMultiText';
import TextBlock from './TextBlock';
import BannerSteps from './BannerSteps';

import type {
  HeroWithCtaFragment,
  TextWithCtaFragment,
  ImageCarouselFragment,
  AccordionFragment,
  HeroFeaturedProductFragment,
  HeroImageWithProductFragment,
  HeroImageMultiTextFragment,
  TextBlockFragment,
  BannerStepsFragment
} from 'types/storefrontapi.generated';
import HeroImageWithProduct from './HeroImageWithProduct';

// Union type for all module types
type Module =
  | HeroWithCtaFragment
  | TextWithCtaFragment
  | ImageCarouselFragment
  | AccordionFragment
  | HeroFeaturedProductFragment
  | HeroImageMultiTextFragment
  | TextBlockFragment
  | BannerStepsFragment;

interface ModuleRendererProps {
  modules: Module[];
  accordionClassName?: string;
}

export default function ModuleRenderer({
  modules,
  accordionClassName,
}: ModuleRendererProps) {
  if (!modules || modules.length === 0) {
    return null;
  }

  return (
    <>
      {modules.map((module, index) => {
        // Use the module's type to determine which component to render
        switch (module.type) {
          case 'hero_with_cta':
            return (
              <HeroWithCta
                key={module.id || index}
                reference={module as HeroWithCtaFragment}
              />
            );

          case 'hero_text_with_cta':
            return (
              <TextWithCta
                key={module.id || index}
                reference={module as TextWithCtaFragment}
              />
            );

          case 'image_carousel':
            return (
              <CarouselWithCta
                key={module.id || index}
                reference={module as ImageCarouselFragment}
              />
            );

          case 'accordion':
            return (
              <div key={module.id || index} className="page-px">
                <HeroAccordion
                  reference={module as AccordionFragment}
                  className={accordionClassName}
                />
              </div>
            );

          case 'hero_featured_product':
            return (
              <HeroFeaturedProduct
                key={module.id || index}
                reference={module as HeroFeaturedProductFragment}
              />
            );

          case 'hero_image_with_product':
            return (
              <HeroImageWithProduct
                key={module.id || index}
                reference={module as HeroImageWithProductFragment}
              />
            );

          case 'hero_image_multi_text':
            return (
              <HeroImageMultiText
                key={module.id || index}
                reference={module as HeroImageMultiTextFragment}
              />
            );

          case 'text_block':
            return (
              <TextBlock
                key={module.id || index}
                reference={module as TextBlockFragment}
              />
            );

            case 'banner_steps':
            return (
              <BannerSteps
                key={module.id || index}
                reference={module as BannerStepsFragment}
              />
            );

          default:
            // For debugging purposes, you might want to render something that indicates
            // an unknown module type
            console.warn(`Unknown module type: ${module.type}`);
            return null;
        }
      })}
    </>
  );
}
