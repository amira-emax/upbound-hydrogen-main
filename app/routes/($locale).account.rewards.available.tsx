import {
  data,
  useActionData,
  useFetcher,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from 'react-router';
import {VoucherCard} from '~/components/account/VoucherCard';
import {Button} from '~/components/ui/button';
import {getAvailableVouchersToClaim, redeemVoucher, type AvailableVoucher} from '~/lib/rewards';

// The loyalty API doesn't always send a description — fall back to a plain
// summary derived from the discount value/minimum spend so the card isn't
// left blank. discount_type is "fixed" (a flat RM amount) or "percentage".
function describeVoucher(voucher: AvailableVoucher): string | null {
  if (voucher.description) return voucher.description;
  if (voucher.discountValue == null) return null;
  const amount =
    voucher.discountType === 'fixed'
      ? `RM${voucher.discountValue} off`
      : `${voucher.discountValue}% off`;
  return voucher.minSpend ? `${amount} orders above RM${voucher.minSpend}` : `${amount} your order`;
}

type ActionResponse = {
  success: boolean;
  voucherId: string;
  error?: string;
  voucherCode?: string | null;
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

  const result = await redeemVoucher(context, voucherId);
  if (!result.success) {
    return data(
      {success: false, voucherId, error: result.error ?? 'Redemption failed. Please try again.'},
      {status: 502},
    );
  }

  return {success: true, voucherId, voucherCode: result.voucherCode};
}

export default function AccountAvailableRewards() {
  const {availableVouchers} = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionResponse>();
  const fetcher = useFetcher<ActionResponse>();

  const redeemedResult = fetcher.data?.success
    ? fetcher.data
    : actionData?.success
      ? actionData
      : null;
  const redeemedVoucherId = redeemedResult?.voucherId ?? null;

  const redeemError = fetcher.data?.success === false
    ? fetcher.data.error
    : actionData?.success === false
      ? actionData.error
      : null;

  return (
    <div>
      <p className="typo-body-l mb-4">Available vouchers</p>
      {redeemedResult && (
        <p className="typo-caption-responsive text-mid-grey mb-4">
          {redeemedResult.voucherCode
            ? `Redeemed! Your voucher code: ${redeemedResult.voucherCode}`
            : 'Redeemed! Check My Rewards for your new voucher.'}
        </p>
      )}
      {redeemError && (
        <p className="typo-caption-responsive text-red-500 mb-4">{redeemError}</p>
      )}
      <div className="space-y-3">
        {availableVouchers.map((voucher) => {
          const isRedeeming =
            fetcher.state !== 'idle' && fetcher.formData?.get('voucherId') === voucher.id;
          const isRedeemed = redeemedVoucherId === voucher.id;

          const canRedeem = voucher.isEligible && !isRedeeming && !isRedeemed;

          return (
            <VoucherCard
              key={voucher.id}
              title={voucher.title}
              description={describeVoucher(voucher)}
              imageUrl={voucher.imageUrl}
              // Not eligible yet — read-only until the customer meets this
              // voucher's requirements, not just a disabled button.
              className={!voucher.isEligible ? 'opacity-50' : undefined}
              footer={
                <fetcher.Form method="post" className="flex items-center gap-3">
                  <span className="typo-caption-responsive text-mid-grey">
                    {voucher.pointsCost.toLocaleString()} pts
                  </span>
                  <input type="hidden" name="voucherId" value={voucher.id} />
                  <Button type="submit" size="sm" disabled={!canRedeem}>
                    {isRedeemed
                      ? 'Redeemed'
                      : isRedeeming
                        ? 'Redeeming…'
                        : voucher.isEligible
                          ? 'Redeem'
                          : 'Not eligible'}
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
