import {useState} from 'react';
import {data, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';
import {VoucherCard} from '~/components/account/VoucherCard';
import {Button} from '~/components/ui/button';
import {getCustomerVouchers} from '~/lib/rewards';

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
              footer={<CopyCodeButton code={voucher.code} />}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CopyCodeButton({code}: {code: string}) {
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
    <Button type="button" size="sm" variant="mint-black" onClick={handleCopy}>
      {copied ? 'Copied!' : `Copy code (${code})`}
    </Button>
  );
}
