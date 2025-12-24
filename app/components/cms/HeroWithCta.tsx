import {Image} from '@shopify/hydrogen';
import {HeroWithCtaFragment} from 'types/storefrontapi.generated';
import CtaButton from '../CtaButton';

interface HeroWithCtaProps {
  reference: HeroWithCtaFragment;
}

function HeroWithCta({reference}: HeroWithCtaProps) {
  const {title, desktopImage, mobileImage, cta} = reference ?? {};

  return (
    <div className="w-full relative">
      <div className="absolute left-[24px] bottom-[36px] md:left-[38px] md:bottom-[60px] space-y-8">
        <h1 className="text-white mix-blend-difference whitespace-pre-line">
          {title?.value}
        </h1>
        <CtaButton
          reference={cta?.reference ?? null}
          variant="cta"
          size="lg"
          className="rounded-none"
        />
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
        className="md:hidden w-full h-[100vh] object-cover"
        draggable={false}
        sizes="100vw"
      />
    </div>
  );
}

export default HeroWithCta;
