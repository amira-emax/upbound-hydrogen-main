import {useState} from 'react';
import {useLoaderData, type LoaderFunctionArgs, type MetaFunction} from 'react-router';
import {RewardsSummaryCard} from '~/components/account/RewardsSummaryCard';
import {RewardsTabs} from '~/components/account/RewardsTabs';
import {VoucherCard} from '~/components/account/VoucherCard';
import {Button} from '~/components/ui/button';
import {getCustomerRewardsSummary, getCustomerVouchers} from '~/lib/rewards';

export const meta: MetaFunction = () => {
  return [{title: 'My Rewards'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus();

  const [rewardsSummary, vouchers] = await Promise.all([
    getCustomerRewardsSummary(context),
    getCustomerVouchers(context),
  ]);

  return {rewardsSummary, vouchers};
}

export default function AccountRewards() {
  const {rewardsSummary, vouchers} = useLoaderData<typeof loader>();

  return (
    <div className="account-rewards">
      <h2 className="typo-h2 mb-6">Rewards</h2>
      <RewardsTabs />

      <RewardsSummaryCard {...rewardsSummary} />

      <div className="mt-8">
        <p className="typo-body-l mb-4">Your vouchers</p>
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
                footer={<CopyCodeButton code={voucher.code} />}
              />
            ))}
          </div>
        )}
      </div>
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
    <Button type="button" size="sm" variant="outline" onClick={handleCopy}>
      {copied ? 'Copied!' : `Copy code (${code})`}
    </Button>
  );
}
