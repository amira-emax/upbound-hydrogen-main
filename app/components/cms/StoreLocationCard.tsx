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

  return (
    <div className="relative pt-5">
      {/* back layer */}
      <div className="absolute inset-x-2 top-1 bottom-0 rounded-xl bg-black/5" />

      {/* logo layer */}
      <div className="relative -mx-1 h-40 rounded-lg bg-white shadow-md ring-1 ring-black/5 flex items-center justify-center p-4">
        {logoImage && (
          <Image
            data={logoImage}
            className="max-h-16 w-auto object-contain"
            sizes="150px"
          />
        )}
      </div>

      <div className="relative px-6 pt-4 pb-4 text-center">
        <div className="mb-4 flex min-h-[2lh] items-center justify-center">
          <p className="typo-h2 line-clamp-2">{store_name?.value}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="typo-body-l underline underline-offset-2"
        >
          {hasMultipleLocations ? 'Available stores' : 'Address'} {open ? '˅' : '>'}
        </button>

        {open && (
          hasMultipleLocations ? (
            <ul className={cn('mt-3 flex flex-col gap-3 text-left text-sm')}>
              {outletNodes.map((outlet, index) => (
                <li key={outlet.id ?? index}>
                  <p className="font-medium">
                    {outlet.name?.value}
                    {outlet.area?.value ? ` (${outlet.area.value})` : ''}
                  </p>
                  {outlet.address?.value && (
                    <p className="whitespace-pre-line text-black/60">
                      {outlet.address.value}
                    </p>
                  )}
                  {outlet.map_url?.value && (
                    <a
                      href={outlet.map_url.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2"
                    >
                      View on map
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            address?.value && (
              <p className="mt-3 whitespace-pre-line text-left text-sm text-black/60">
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
