import {
  data,
  useActionData,
  useFetcher,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from 'react-router';
import {RewardsTabs} from '~/components/account/RewardsTabs';
import {VoucherCard} from '~/components/account/VoucherCard';
import {Button} from '~/components/ui/button';
import {getAvailableVouchersToClaim} from '~/lib/rewards';

type ActionResponse = {
  success: boolean;
  voucherId: string;
};

export const meta: MetaFunction = () => {
  return [{title: 'Available Vouchers'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus();

  const availableVouchers = await getAvailableVouchersToClaim(context);

  return {availableVouchers};
}

export async function action({request, context}: ActionFunctionArgs) {
  await context.customerAccount.handleAuthStatus();

  const form = await request.formData();
  const voucherId = form.get('voucherId')?.toString();

  if (!voucherId) {
    return data({success: false, voucherId: ''}, {status: 400});
  }

  // TODO: once the redemption contract is defined, look up the claimed
  // voucher's details and call Shopify's Admin API (e.g.
  // discountCodeBasicCreate) to actually create a "Specific customers"
  // discount for this customer, scoped to their id from CUSTOMER_ID_QUERY.
  // For now this just simulates a successful redemption.
  return {success: true, voucherId};
}

export default function AccountAvailableRewards() {
  const {availableVouchers} = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionResponse>();
  const fetcher = useFetcher<ActionResponse>();

  const redeemedVoucherId = fetcher.data?.success
    ? fetcher.data.voucherId
    : actionData?.success
      ? actionData.voucherId
      : null;

  return (
    <div className="account-rewards">
      <h2 className="typo-h2 mb-6">Rewards</h2>
      <RewardsTabs />

      <p className="typo-body-l mb-4">Available vouchers</p>
      {redeemedVoucherId && (
        <p className="typo-caption-responsive text-mid-grey mb-4">
          Redeemed! Check My Rewards for your new voucher.
        </p>
      )}
      <div className="space-y-3">
        {availableVouchers.map((voucher) => {
          const isRedeeming =
            fetcher.state !== 'idle' && fetcher.formData?.get('voucherId') === voucher.id;
          const isRedeemed = redeemedVoucherId === voucher.id;

          return (
            <VoucherCard
              key={voucher.id}
              title={voucher.title}
              description={voucher.description}
              footer={
                <fetcher.Form method="post" className="flex items-center gap-3">
                  <span className="typo-caption-responsive text-mid-grey">
                    {voucher.pointsCost.toLocaleString()} pts
                  </span>
                  <input type="hidden" name="voucherId" value={voucher.id} />
                  <Button type="submit" size="sm" disabled={isRedeeming || isRedeemed}>
                    {isRedeemed ? 'Redeemed' : isRedeeming ? 'Redeeming…' : 'Redeem'}
                  </Button>
                </fetcher.Form>
              }
            />
          );
        })}
      </div>
    </div>
  );
}
