import { useState } from 'react';
import { Image } from '@shopify/hydrogen';
import { cn } from '~/lib/utils';
import type { StoreLocationFragment } from 'types/storefrontapi.generated';

interface StoreLocationCardProps {
  reference: StoreLocationFragment;
}

function StoreLocationCard({ reference }: StoreLocationCardProps) {
  const [open, setOpen] = useState(false);

  const {
    store_name,
    store_logo,
    more_than_1_location,
    address,
    outlets,
  } = reference;

  const hasMultipleLocations = more_than_1_location?.value === 'true';
  const outletNodes = outlets?.references?.nodes ?? [];
  const logoImage = store_logo?.reference?.image;

  const outletsByArea = outletNodes.reduce<Record<string, typeof outletNodes>>(
    (groups, outlet) => {
      const area = outlet.area?.value ?? '';
      groups[area] = groups[area] ?? [];
      groups[area].push(outlet);
      return groups;
    },
    {},
  );

  return (
    <div className="relative pt-5">
      {/* back layer */}
      <div className="absolute inset-x-2 top-1 bottom-0 rounded-xl bg-[#f2f2f2] shadow-[5px_7px_9px_rgba(0,0,0,0.25)]" />

      {/* logo layer */}
      <div className="relative -mx-1 h-40 rounded-lg bg-white shadow-[5px_7px_9px_rgba(0,0,0,0.25)] ring-1 ring-black/5 flex items-center justify-center p-8 overflow-hidden">
        {logoImage && (
          <Image
            data={logoImage}
            className="h-full w-full object-contain"
            sizes="200px"
          />
        )}
      </div>

      <div className="relative px-6 pt-4 pb-4 text-center">
        <div className="mb-4 flex min-h-12 items-center justify-center md:min-h-16">
          <p className="typo-h2 text-2xl line-clamp-2">{store_name?.value}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={cn('typo-body-l underline-offset-2 hover:underline', open && 'underline')}
        >
          {hasMultipleLocations ? 'Available stores' : 'Address'} {open ? '˅' : '>'}
        </button>

        {open && (
          hasMultipleLocations ? (
            <div className={cn('mt-3 flex flex-col gap-4 text-sm')}>
              {Object.entries(outletsByArea).map(([area, areaOutlets]) => (
                <div key={area}>
                  {area && <p className="font-semibold">{area}</p>}
                  <ul className="list-inside list-[circle]">
                    {areaOutlets.map((outlet, index) => (
                      <li key={outlet.id ?? index}>
                        {outlet.map_url?.value ? (
                          <a
                            href={outlet.map_url.value}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {outlet.name?.value}
                          </a>
                        ) : (
                          outlet.name?.value
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            address?.value && (
              <p className="mt-3 whitespace-pre-line text-center text-sm">
                {address.value}
              </p>
            )
          )
        )}
      </div>
    </div>
  );
}

export default StoreLocationCard;
