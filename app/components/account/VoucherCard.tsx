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
        'bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-3 pr-4 flex items-center justify-between gap-4',
        className,
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <VoucherImage imageUrl={imageUrl} />
        <div className="min-w-0">
          <p className="typo-body-l truncate">{title}</p>
          {description && (
            <p className="typo-caption-responsive text-mid-grey mt-0.5 truncate">{description}</p>
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
        className="size-11 shrink-0 object-cover rounded-xl"
      />
    );
  }

  return (
    <div className="size-11 shrink-0 flex items-center justify-center rounded-xl bg-neutral-100">
      <Ticket className="size-5 text-mid-grey" />
    </div>
  );
}
