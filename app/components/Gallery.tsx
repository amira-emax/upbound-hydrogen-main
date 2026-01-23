import { Image } from '@shopify/hydrogen';

interface GalleryProps {
  reference?: Array<{
    id?: string;
    image?: {
      reference?: {
        image?: {
          url: string;
          altText?: string;
        };
      };
    };
    title?: { value?: string };
    caption?: { value?: string };
  }>;
}

function Gallery({ reference }: GalleryProps) {
  if (!reference) reference = [];

  // Maximum of 6 default squares
  const totalSquares = Math.max(6, reference.length);

  return (
    <section className="grid grid-cols-3 gap-4 py-10">
      {Array.from({ length: totalSquares }).map((_, i) => {
        const item = reference[i];

        return (
          <div
            key={item?.id ?? `placeholder-${i}`}
            className="relative w-full aspect-square bg-[#e7e6e9] rounded-lg overflow-hidden flex items-center justify-center"
          >
            {item?.image?.reference?.image ? (
              <Image
                data={item.image.reference.image}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-sm"></span>
            )}

            {/* Optional overlay for title/caption */}
            {item?.title?.value && (
              <div className="absolute bottom-0 left-0 w-full p-2 bg-black bg-opacity-50 text-white text-xs">
                {item.title.value}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

export default Gallery;
