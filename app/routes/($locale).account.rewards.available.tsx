import {useEffect, useState} from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {getAvailableVouchersToClaim, redeemVoucher, type AvailableVoucher} from '~/lib/rewards';

// discount_type is "fixed" (a flat RM amount) or "percentage".
function formatDiscountAmount(voucher: AvailableVoucher): string | null {
  if (voucher.discountValue == null) return null;
  return voucher.discountType === 'fixed'
    ? `RM${voucher.discountValue} off`
    : `${voucher.discountValue}% off`;
}

// The loyalty API doesn't always send a description — fall back to a plain
// summary derived from the discount value/minimum spend so the card isn't
// left blank.
function describeVoucher(voucher: AvailableVoucher): string | null {
  if (voucher.description) return voucher.description;
  const amount = formatDiscountAmount(voucher);
  if (!amount) return null;
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

  // Per-customer vouchers — must never be cached, or a shared browser/CDN
  // cache could serve one customer's available vouchers to another.
  return data(
    {availableVouchers},
    {headers: {'Cache-Control': 'no-cache, no-store, must-revalidate'}},
  );
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
  const [detailsVoucher, setDetailsVoucher] = useState<AvailableVoucher | null>(null);

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

  // Close the popup as soon as its voucher is redeemed, so the "Redeemed!"
  // banner (rendered above the list, not inside the dialog) is visible.
  useEffect(() => {
    if (detailsVoucher && redeemedVoucherId === detailsVoucher.id) {
      setDetailsVoucher(null);
    }
  }, [redeemedVoucherId, detailsVoucher]);

  return (
    <div>
      <p className="typo-body-l mb-4">Available Vouchers</p>
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
              onOpenDetails={() => setDetailsVoucher(voucher)}
              footer={
                <fetcher.Form method="post" className="flex items-center gap-3">
                  <span className="typo-caption-responsive text-mid-grey">
                    {voucher.pointsCost.toLocaleString()} pts
                  </span>
                  <input type="hidden" name="voucherId" value={voucher.id} />
                  <Button type="submit" size="sm" variant="mint-black" disabled={!canRedeem}>
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

      <Dialog
        open={detailsVoucher != null}
        onOpenChange={(open) => !open && setDetailsVoucher(null)}
      >
        {detailsVoucher && (
          <VoucherDetailsContent
            voucher={detailsVoucher}
            fetcher={fetcher}
            isRedeeming={
              fetcher.state !== 'idle' &&
              fetcher.formData?.get('voucherId') === detailsVoucher.id
            }
          />
        )}
      </Dialog>
    </div>
  );
}

function VoucherDetailsContent({
  voucher,
  fetcher,
  isRedeeming,
}: {
  voucher: AvailableVoucher;
  fetcher: ReturnType<typeof useFetcher<ActionResponse>>;
  isRedeeming: boolean;
}) {
  const amount = formatDiscountAmount(voucher);
  const canRedeem = voucher.isEligible && !isRedeeming;

  return (
    <DialogContent className="bg-white backdrop-blur-none">
      <DialogHeader>
        <DialogTitle>{voucher.title}</DialogTitle>
        {voucher.description && (
          <DialogDescription>{voucher.description}</DialogDescription>
        )}
      </DialogHeader>
      <dl className="space-y-3">
        {amount && (
          <DetailRow label="Discount">{amount}</DetailRow>
        )}
        {voucher.minSpend != null && (
          <DetailRow label="Minimum spend">RM{voucher.minSpend}</DetailRow>
        )}
        {voucher.minQuantity > 0 && (
          <DetailRow label="Minimum quantity">{voucher.minQuantity} item(s)</DetailRow>
        )}
        <DetailRow label="Points required">{voucher.pointsCost.toLocaleString()} pts</DetailRow>
        <DetailRow label="Redeemable">
          {voucher.maxRedeem} time{voucher.maxRedeem === 1 ? '' : 's'} per customer
        </DetailRow>
        <DetailRow label="Expiry">
          {voucher.hasExpiry ? 'Expires after redemption' : 'No expiry'}
        </DetailRow>
        {!voucher.isEligible && (
          <DetailRow label="Eligibility">
            <span className="text-red-500">You don&apos;t meet the requirements yet</span>
          </DetailRow>
        )}
      </dl>
      <DialogFooter>
        <fetcher.Form method="post" className="w-full">
          <input type="hidden" name="voucherId" value={voucher.id} />
          <Button type="submit" variant="mint-black" className="w-full" disabled={!canRedeem}>
            {isRedeeming ? 'Redeeming…' : voucher.isEligible ? 'Redeem' : 'Not eligible'}
          </Button>
        </fetcher.Form>
      </DialogFooter>
    </DialogContent>
  );
}

function DetailRow({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="typo-caption-responsive text-mid-grey">{label}</dt>
      <dd className="typo-caption-responsive text-right">{children}</dd>
    </div>
  );
}
