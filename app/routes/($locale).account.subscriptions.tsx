import type {
  SubscriptionBillingPolicyFragment,
  SubscriptionDiscountFragmentFragment,
} from 'types/customer-accountapi.generated';
import {
  data,
  Link,
  useActionData,
  useFetcher,
  useLoaderData,
  type MetaFunction,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from 'react-router';
import {Money, Image} from '@shopify/hydrogen';
import {Package} from 'lucide-react';
import {SUBSCRIPTIONS_CONTRACTS_QUERY} from '../graphql/customer-account/CustomerSubscriptionsQuery';
import {SUBSCRIPTION_CANCEL_MUTATION} from '../graphql/customer-account/CustomerSubscriptionsMutations';
import {Button} from '~/components/ui/button';

export type ActionResponse = {
  error: string | null;
};

export const meta: MetaFunction = () => {
  return [{title: 'Subscriptions'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus();

  const {data: subscriptions} = await context.customerAccount.query(
    SUBSCRIPTIONS_CONTRACTS_QUERY,
  );

  return {subscriptions};
}

export async function action({request, context}: ActionFunctionArgs) {
  const {customerAccount} = context;

  if (request.method !== 'DELETE') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const subId = form.get('subId');

    if (!subId) {
      throw new Error('Subscription ID is required');
    }

    await customerAccount.mutate(SUBSCRIPTION_CANCEL_MUTATION, {
      variables: {
        subscriptionContractId: subId.toString(),
      },
    });

    return {
      error: null,
    };
  } catch (error: any) {
    return data(
      {
        error: error.message,
      },
      {
        status: 400,
      },
    );
  }
}

export default function AccountSubscriptions() {
  const action = useActionData<ActionResponse>();
  const {subscriptions} = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const contracts = subscriptions?.customer?.subscriptionContracts.nodes ?? [];

  return (
    <div className="account-profile max-w-xl space-y-4">
      <h2 className="typo-h2">My Subscriptions</h2>
      {action?.error && (
        <p className="typo-caption-responsive text-red-500">{action.error}</p>
      )}
      {contracts.length ? (
        <div className="space-y-4">
          {contracts.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              fetcher={fetcher}
            />
          ))}
        </div>
      ) : (
        <NoSubscriptionsFound />
      )}
    </div>
  );
}

// Matches the "no orders yet" nudge on Order History — same layout, own copy.
function NoSubscriptionsFound() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-10 text-center shadow-sm">
      <div>
        <p className="typo-body-l">No Subscriptions Found</p>
        <p className="typo-caption-responsive text-mid-grey">
          Start shopping to create your first subscription!
        </p>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link to="/collections/all">Shop Now</Link>
      </Button>
    </div>
  );
}

type Contract = NonNullable<
  ReturnType<typeof useLoaderData<typeof loader>>['subscriptions']
>['customer']['subscriptionContracts']['nodes'][number];

function SubscriptionCard({
  subscription,
  fetcher,
}: {
  subscription: Contract;
  fetcher: ReturnType<typeof useFetcher>;
}) {
  const isBeingCancelled =
    fetcher.state !== 'idle' &&
    fetcher.formData?.get('subId') === subscription.id;

  const lines = subscription.lines.nodes;
  const firstLine = lines[0];
  const extraLinesCount = lines.length - 1;

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {firstLine?.image ? (
          <Image
            data={firstLine.image}
            width={64}
            height={64}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-mid-grey">
            <Package className="size-6" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="typo-body-l truncate">
          {firstLine?.name}
          {extraLinesCount > 0 && (
            <span className="text-mid-grey"> +{extraLinesCount} more</span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-mid-grey">
          <p className="typo-caption-responsive">
            Every <SubscriptionInterval billingPolicy={subscription.billingPolicy} />
          </p>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              subscription.status === 'ACTIVE'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {subscription.status}
          </span>
        </div>
        {subscription.discounts?.nodes && subscription.discounts.nodes.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {subscription.discounts.nodes.map((discount) => (
              <span
                key={discount.id}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-mid-grey"
              >
                {formatDiscountValue(discount)}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        {firstLine?.currentPrice && (
          <p className="typo-body-l">
            <Money data={firstLine.currentPrice} />
          </p>
        )}
        {subscription.status === 'ACTIVE' && (
          <fetcher.Form method="DELETE">
            <input type="hidden" name="subId" value={subscription.id} />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={isBeingCancelled}
            >
              {isBeingCancelled ? 'Canceling' : 'Cancel'}
            </Button>
          </fetcher.Form>
        )}
      </div>
    </div>
  );
}

function SubscriptionInterval({
  billingPolicy,
}: {
  billingPolicy: SubscriptionBillingPolicyFragment;
}) {
  const count = billingPolicy.intervalCount?.count;
  function getInterval() {
    const suffix = count === 1 ? '' : 's';
    switch (billingPolicy.interval) {
      case 'DAY':
        return 'day' + suffix;
      case 'WEEK':
        return 'week' + suffix;
      case 'MONTH':
        return 'month' + suffix;
      case 'YEAR':
        return 'year' + suffix;
    }
  }
  return (
    <span>
      {count} {getInterval()}
    </span>
  );
}

function formatDiscountValue(
  discount: SubscriptionDiscountFragmentFragment,
): string {
  const value = discount.value;

  if (value?.__typename === 'SubscriptionDiscountPercentageValue') {
    return `${value.percentage}% off`;
  } else if (value?.__typename === 'SubscriptionDiscountFixedAmountValue') {
    return `$${value.amount.amount} off`;
  } else if (discount.title) {
    return discount.title;
  }

  return 'Discount applied';
}
