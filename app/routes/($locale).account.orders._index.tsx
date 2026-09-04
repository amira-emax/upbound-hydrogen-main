import {Link, useLoaderData, type MetaFunction} from 'react-router';
import {Money, Image, getPaginationVariables} from '@shopify/hydrogen';
import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Package} from 'lucide-react';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import type {
  CustomerOrdersFragment,
  OrderItemFragment,
} from 'types/customer-accountapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {Pagination} from '@shopify/hydrogen';
import {Button} from '~/components/ui/button';

export const meta: MetaFunction = () => {
  return [{title: 'Orders'}];
};

export async function loader({request, context}: LoaderFunctionArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_ORDERS_QUERY,
    {
      variables: {
        ...paginationVariables,
      },
    },
  );

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer};
}

export default function Orders() {
  const {customer} = useLoaderData<{customer: CustomerOrdersFragment}>();
  const {orders} = customer;

  return (
    <div className="orders max-w-xl space-y-4">
      <WelcomeShopCard />
      {orders.nodes.length ? (
        <OrderList orders={orders} />
      ) : (
        <p className="typo-caption-responsive text-mid-grey">
          You haven&apos;t placed any orders yet.
        </p>
      )}
    </div>
  );
}

// Always the first card on the page — a shopping nudge, not tied to whether
// the customer has past orders.
function WelcomeShopCard() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm">
      <div>
        <p className="typo-h2 mb-2">Welcome</p>
        <p className="typo-h2 text-mid-grey">Ready to shop?</p>
      </div>
      <Button asChild variant="mint-black" size="default" className="typo-body-l">
        <Link to="/collections/all">Shop Now</Link>
      </Button>
    </div>
  );
}

// One card per order, same layout on every breakpoint.
function OrderList({orders}: Pick<CustomerOrdersFragment, 'orders'>) {
  return (
    <div className="space-y-4">
      <PaginatedResourceSection connection={orders} resourcesClassName="space-y-4">
        {({node: order}) => <OrderCard key={order.id} order={order} />}
      </PaginatedResourceSection>

      <div className="flex justify-center pt-2">
        <Pagination connection={orders}>
          {({isLoading, PreviousLink, NextLink}) => (
            <div className="flex gap-4">
              <PreviousLink className="px-4 py-2 border rounded hover:bg-gray-100">
                {isLoading ? 'Loading...' : '← Previous'}
              </PreviousLink>
              <NextLink className="px-4 py-2 border rounded hover:bg-gray-100">
                {isLoading ? 'Loading...' : 'Next →'}
              </NextLink>
            </div>
          )}
        </Pagination>
      </div>
    </div>
  );
}

function OrderCard({order}: {order: OrderItemFragment}) {
  const orderLink = `/account/orders/${btoa(order.id)}`;
  const orderDate = new Date(order.processedAt).toLocaleDateString();
  const firstItem = order.lineItems?.nodes?.[0];

  return (
    <Link
      to={orderLink}
      className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
    >
      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {firstItem?.image ? (
          <Image
            data={firstItem.image}
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
        <div className="flex items-center justify-between gap-2">
          <p className="typo-body-l truncate">Order #{order.number}</p>
          <p className="typo-body-l shrink-0">
            <Money data={order.totalPrice} />
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 text-mid-grey">
          <p className="typo-caption-responsive">{orderDate}</p>
          <p className="typo-caption-responsive">{order.financialStatus}</p>
        </div>
      </div>
    </Link>
  );
}
