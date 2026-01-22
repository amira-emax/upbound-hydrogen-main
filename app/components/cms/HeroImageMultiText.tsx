import { Image } from '@shopify/hydrogen';
import { HeroImageMultiTextFragment } from 'types/storefrontapi.generated';


interface HeroImageMultiTextProps {
  reference: HeroImageMultiTextFragment;
}

function HeroImageMultiText({ reference }: HeroImageMultiTextProps) {
  const {
    background_image,
    enable_overlay,
    overlay_opacity,
    logo,
    texts,
  } = reference ?? {};

  // Background image URL
  const bgUrl = background_image?.reference?.image?.url;
  const bgAlt = background_image?.reference?.image?.altText ?? '';

  return (
    <div className="w-full relative h-[80vh] md:h-[80vh] p-10">
      {/* Background Image */}
      {bgUrl && (
        <Image
          data={background_image?.reference?.image ?? undefined}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}

        />
      )}

      {/* Overlay */}
      {enable_overlay?.value === 'true' && (
        <div
          className="absolute inset-0 bg-black"
          style={{
            opacity: Number(overlay_opacity?.value ?? 40) / 100,
          }}
        />
      )}

      {/* Logos (top center) */}
      {logo?.references?.nodes?.length > 0 && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-4 z-10 pt-[5rem]">
          {logo.references.nodes.map((logos, i) => {
            const img = logos.image?.reference?.image;
            if (!img) return null;
            return (
              <Image
                key={i}
                data={logos.image.reference.image}
                className="h-20"
                draggable={false}
                sizes="100vw"
                alt={img.altText ?? ''}
              />
            );
          })}
        </div>
      )}

      <div className="relative w-full h-full p-8">
        {/* Text blocks */}
        {texts?.references?.nodes?.map((block, i) => {
          const text = block.text?.value;
          const label = block.label?.value;
          if (!text && !label) return null;

          const position = block.position?.value ?? 'center';
          let fontSize = block.font_size?.value ?? 'text-xl';
          const fontWeight = block.font_weight?.value ?? 'font-normal';
          const textColor = block.text_color?.value ?? 'text-black';
          const Tag = block.tag?.value ?? 'div';

          if (Tag !== 'div') fontSize = '';

          // Determine positioning classes
          let positionClass = '';
          let alignmentClass = '';

          switch (position) {
            case 'center':
              positionClass = 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
              alignmentClass = 'text-center';
              break;
            case 'top-left':
              positionClass = 'top-4 left-4';
              alignmentClass = 'text-left';
              break;
            case 'top-right':
              positionClass = 'top-4 right-4';
              alignmentClass = 'text-right';
              break;
            case 'center-left':
              positionClass = 'top-1/2 left-4 -translate-y-1/2';
              alignmentClass = 'text-left';
              break;
            case 'center-right':
              positionClass = 'top-1/2 right-4 -translate-y-1/2';
              alignmentClass = 'text-right';
              break;
            case 'bottom-left':
              positionClass = 'bottom-8 left-8';
              alignmentClass = 'text-left';
              break;
            case 'bottom-right':
              positionClass = 'bottom-8 right-8';
              alignmentClass = 'text-right';
              break;
            default:
              // fallback to center
              positionClass = 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
              alignmentClass = 'text-center';
          }


          return (
            <div key={i} className={`absolute z-10 ${positionClass} ${textColor}`}>

              <Tag className={`${alignmentClass} ${fontSize} ${fontWeight}  max-w-xs md:max-w-sm`}>
                {label && (
                  <span className="block text-sm mb-1">
                    {label}
                  </span>
                )}
                <span dangerouslySetInnerHTML={{ __html: text }} />
              </Tag>
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default HeroImageMultiText;
