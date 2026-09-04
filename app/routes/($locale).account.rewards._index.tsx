import {useState} from 'react';
import {data, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';
import {VoucherCard} from '~/components/account/VoucherCard';
import {Button} from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {getCustomerVouchers, type CartDiscountOption} from '~/lib/rewards';

// Shopify's discount summary packs several clauses into one bullet-joined
// string (e.g. "RM10 off • Minimum purchase of RM50 •") — split it back out
// so the popup can show each clause on its own line instead of one run-on.
function splitDiscountDescription(description: string): string[] {
  return description
    .split('•')
    .map((part) => part.trim())
    .filter(Boolean);
}

export const meta: MetaFunction = () => {
  return [{title: 'My Rewards'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus();

  const vouchers = await getCustomerVouchers(context);

  // Per-customer vouchers — must never be cached, or a shared browser/CDN
  // cache could serve one customer's vouchers to another.
  return data(
    {vouchers},
    {headers: {'Cache-Control': 'no-cache, no-store, must-revalidate'}},
  );
}

export default function AccountRewardsIndex() {
  const {vouchers} = useLoaderData<typeof loader>();
  const [detailsVoucher, setDetailsVoucher] = useState<CartDiscountOption | null>(null);

  return (
    <div>
      <p className="typo-body-l mb-4">My Vouchers</p>
      {vouchers.length === 0 ? (
        <p className="typo-caption-responsive text-mid-grey">
          You don&apos;t have any vouchers yet.
        </p>
      ) : (
        <div className="space-y-3">
          {vouchers.map((voucher) => (
            <VoucherCard
              key={voucher.code}
              title={voucher.label}
              description={voucher.description}
              onOpenDetails={() => setDetailsVoucher(voucher)}
              footer={<CopyCodeButton code={voucher.code} />}
            />
          ))}
        </div>
      )}

      <Dialog
        open={detailsVoucher != null}
        onOpenChange={(open) => !open && setDetailsVoucher(null)}
      >
        {detailsVoucher && (
          <DialogContent className="bg-white backdrop-blur-none">
            <DialogHeader>
              <DialogTitle>{detailsVoucher.label}</DialogTitle>
            </DialogHeader>
            {detailsVoucher.description && (
              <div className="space-y-1">
                {splitDiscountDescription(detailsVoucher.description).map((line, index) => (
                  <p key={index} className="typo-caption-responsive text-mid-grey">
                    {line}
                  </p>
                ))}
              </div>
            )}
            <DialogFooter>
              <CopyCodeButton code={detailsVoucher.code} className="w-full" />
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

function CopyCodeButton({code, className}: {code: string; className?: string}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy voucher code:', error);
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="mint-black"
      className={className}
      onClick={handleCopy}
    >
      {copied ? 'Copied!' : `Copy code (${code})`}
    </Button>
  );
}
