import { Image } from '@shopify/hydrogen';
import type { GalleryRowsFragment } from 'types/storefrontapi.generated';

interface GalleryRowsProps {
  reference?: GalleryRowsFragment | null;
}

function GalleryRows({ reference }: GalleryRowsProps) {

  if (!reference) return null;

  return (
    <section>
      {reference.map((row, index) => {
        if (!row) return null;

        const image = row.image;
        const isImageLeft = index % 2 === 1;

        return (
          <div
            key={row.id ?? index}
            className="grid grid-cols-1 md:grid-cols-5 items-stretch"
          >
            {/* IMAGE */}
            {image && (
              <div
                className={`
              md:col-span-3 h-full
              ${isImageLeft ? 'md:order-1 order-2' : 'md:order-3 order-2'}
            `}
              >
                <Image
                  data={image}
                  className="w-full h-full object-cover"
                  sizes="(min-width: 768px) 60vw, 100vw"
                />
              </div>
            )}

            {/* TEXT */}
            <div
              className={`
            md:col-span-2 flex flex-col justify-center p-10 h-full
            ${isImageLeft ? 'md:order-3 order-1' : 'md:order-1 order-1'}
          `}
              style={{ backgroundColor: '#e7e6e9' }}
            >
              {row.label && (
                <p className="text-sm tracking-wide">{row.label}</p>
              )}

              {row.title && (
                <h2
                  className="font-semibold"
                  dangerouslySetInnerHTML={{ __html: row.title }}
                />
              )}
            </div>
          </div>
        );
      })}
    </section>

  );
}


export default GalleryRows;