import {data, redirect} from '@shopify/remix-oxygen';
import {Outlet, useLoaderData, type LoaderFunctionArgs, type MetaFunction} from 'react-router';
import {RewardsSummaryCard} from '~/components/account/RewardsSummaryCard';
import {RewardsTabs} from '~/components/account/RewardsTabs';
import {getCustomerRewardsSummary, isRewardsEligible} from '~/lib/rewards';

export const meta: MetaFunction = () => {
  return [{title: 'Rewards'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus();

  // Rewards is still rolled out only to whitelisted test accounts — kick
  // everyone else back to their profile rather than showing a broken/empty
  // section (also protects direct navigation to /account/rewards/*).
  if (!(await isRewardsEligible(context))) {
    throw redirect('/account/profile');
  }

  const rewardsSummary = await getCustomerRewardsSummary(context);

  // Per-customer data (points/tier) — must never be cached, or a shared
  // browser/CDN cache could serve one customer's summary to another.
  return data(
    {rewardsSummary},
    {headers: {'Cache-Control': 'no-cache, no-store, must-revalidate'}},
  );
}

/**
 * Shared layout for the Rewards section — points/tier card at the top,
 * then the "My Rewards" / "Available Vouchers" tabs, with each page's own
 * content rendered into the Outlet below.
 */
export default function AccountRewardsLayout() {
  const {rewardsSummary} = useLoaderData<typeof loader>();

  return (
    <div className="account-rewards">
      <h2 className="typo-h2 mb-4">Your Points</h2>
      <RewardsSummaryCard {...rewardsSummary} />

      <h2 className="typo-h2 mt-8 mb-4">Rewards</h2>
      <RewardsTabs />

      <Outlet />
    </div>
  );
}
