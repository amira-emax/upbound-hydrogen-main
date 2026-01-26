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

  const items = texts?.references?.nodes ?? [];
  
  const minItems = 3;
  const paddedItems =
    items.length <= minItems
      ? [
        
        {
          id: 'placeholder-top-center',
          position: { value: 'top-center' },
          text: { value: '&nbsp;' },
          label: { value: '' },
          listing: { value: '[]' },
          font_size: { value: 'text-xl' },
          font_weight: { value: 'font-normal' },
          text_color: { value: 'text-black' },
          tag: { value: 'div' },
        },
        ...items,
      ]
      : items;

  return (

    <div className="w-full relative h-[80vh] md:h-[80vh] p-10">
      {/* Background Image */}
      {bgUrl && (
        <Image
          data={background_image?.reference?.image ?? undefined}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
          sizes='80vh'

        />
      )}

      {/* Overlay */}
      {enable_overlay?.value === 'true' && (
        <div
          className="absolute inset-0 bg-black"
          style={{
            opacity: Number(overlay_opacity?.value ?? 60) / 100,
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
                className="lg:h-20"
                draggable={false}
                sizes="100vw"
                alt={img.altText ?? ''}
              />
            );
          })}
        </div>
      )}

      <div className="relative z-10 w-full h-full ">

        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-6 h-full">


          {/* Text blocks */}

          {paddedItems.map((block, i) => {
            const text = block.text?.value;
            const label = block.label?.value;

            const listItems: string[] = (() => {
              try {
                return block.listing?.value ? JSON.parse(block.listing?.value) : [];
              } catch {
                return [];
              }
            })();

            if (!text && !label && listItems.length === 0) return null;


            const POSITION_GRID_MAP: Record<
              string,
              { col: string; row: string; align: string }
            > = {
              'top-left': { col: 'md:col-start-1', row: 'md:row-start-1 md:justify-start', align: 'md:text-left' },
              'top-center': { col: 'md:col-start-2', row: 'md:row-start-1', align: 'text-center' },
              'top-right': { col: 'md:col-start-3', row: 'md:row-start-1 md:justify-end', align: 'md:text-right' },

              'center-left': { col: 'md:col-start-1', row: 'md:row-start-2 md:justify-start', align: 'md:text-left' },
              'center': { col: 'md:col-start-2', row: 'md:row-start-2', align: 'text-center' },
              'center-right': { col: 'md:col-start-3', row: 'md:row-start-2 md:justify-end', align: 'md:text-right' },

              'bottom-left': { col: 'md:col-start-1', row: 'md:row-start-3 md:justify-start', align: 'md:text-left' },
              'bottom-center': { col: 'md:col-start-2', row: 'md:row-start-3', align: 'text-center' },
              'bottom-right': { col: 'md:col-start-3', row: 'md:row-start-3 md:justify-end', align: 'md:text-right' },
            };

            const position = block.position?.value ?? 'center';
            let fontSize = block.font_size?.value ?? 'text-xl';
            const fontWeight = block.font_weight?.value ?? 'font-normal';
            const textColor = block.text_color?.value ?? 'text-black';
            const Tag = block.tag?.value ?? 'div';

            if (Tag !== 'div') fontSize = '';

            const grid = POSITION_GRID_MAP[position] ?? POSITION_GRID_MAP.center;

            return (

              <div
                key={i}
                className={`${textColor} ${grid.col} ${grid.row} flex items-center justify-center`}
              >
                <Tag
                  className={`${grid.align} ${fontSize} ${fontWeight} text-center max-w-xs md:max-w-sm lg:max-w-lg `}>
                  {label}

                  <span dangerouslySetInnerHTML={{ __html: text }} />

                  {listItems.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2 justify-center md:justify-end">
                      {listItems.map((item, idx) => (
                        <li key={idx}>
                          <span className="px-3 py-1 border rounded-full text-sm">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Tag>
              </div>


            );
          })}

        </div>

      </div>

    </div>
  );
}

export default HeroImageMultiText;
