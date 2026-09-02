import type {ReactNode} from 'react';
import {Ticket} from 'lucide-react';
import {cn} from '~/lib/utils';

type VoucherCardProps = {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  footer: ReactNode;
  className?: string;
};

/**
 * Shared card shell for a single voucher, used by both the "My Rewards"
 * page (owned vouchers — footer shows the code + a copy button) and the
 * "Available Vouchers" page (claimable vouchers — footer shows the points
 * cost + a redeem button).
 */
export function VoucherCard({title, description, imageUrl, footer, className}: VoucherCardProps) {
  return (
    <div
      className={cn(
        'border border-neutral-400 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <VoucherImage imageUrl={imageUrl} />
        <div>
          <p className="typo-body-l">{title}</p>
          {description && (
            <p className="typo-caption-responsive text-mid-grey mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="shrink-0">{footer}</div>
    </div>
  );
}

// TODO: swap in real voucher images once an API supplies imageUrl — this
// icon is just a placeholder for now.
function VoucherImage({imageUrl}: {imageUrl?: string | null}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className="size-12 shrink-0 object-cover rounded-sm border border-neutral-400"
      />
    );
  }

  return (
    <div className="size-12 shrink-0 flex items-center justify-center rounded-sm border border-neutral-400 bg-gray-100">
      <Ticket className="size-5 text-mid-grey" />
    </div>
  );
}
