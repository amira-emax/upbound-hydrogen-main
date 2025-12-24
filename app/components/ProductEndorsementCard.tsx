import {Image} from '@shopify/hydrogen';
import {ProductEndorsementCardFragment} from 'types/storefrontapi.generated';
import {cn} from '~/lib/utils';

function ProductEndorsementCard({
  endorsement,
  isLast,
}: {
  endorsement: ProductEndorsementCardFragment;
  isLast?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row gap-4 md:gap-6 items-center',
        !isLast && 'pb-6 md:pb-0 border-b-1 md:border-b-0',
      )}
    >
      <div className="flex-1 aspect-[480/320] rounded-xl overflow-hidden flex-shrink-0">
        <Image
          data={endorsement.image?.reference?.image ?? undefined}
          className="w-full h-full object-cover"
          sizes="(min-width: 45em) 320px, 100vw"
          width={endorsement.image?.reference?.image?.width || 480}
          height={endorsement.image?.reference?.image?.height || 320}
          loading="lazy"
        />
      </div>
      <div className="flex-2">
        <p className="typo-body-l whitespace-break-spaces mb-6 md:mb-10">
          {endorsement.description?.value}
        </p>
        <p>{endorsement.name?.value}</p>
        <p className="text-mid-grey">{endorsement.position?.value}</p>
      </div>
    </div>
  );
}

export default ProductEndorsementCard;
