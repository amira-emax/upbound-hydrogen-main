import type {ReactNode} from 'react';
import {cn} from '~/lib/utils';

type VoucherCardProps = {
  title: string;
  description?: string;
  footer: ReactNode;
  className?: string;
};

/**
 * Shared card shell for a single voucher, used by both the "My Rewards"
 * page (owned vouchers — footer shows the code + a copy button) and the
 * "Available Vouchers" page (claimable vouchers — footer shows the points
 * cost + a redeem button).
 */
export function VoucherCard({title, description, footer, className}: VoucherCardProps) {
  return (
    <div
      className={cn(
        'border border-neutral-400 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div>
        <p className="typo-body-l">{title}</p>
        {description && (
          <p className="typo-caption-responsive text-mid-grey mt-1">{description}</p>
        )}
      </div>
      <div className="shrink-0">{footer}</div>
    </div>
  );
}
