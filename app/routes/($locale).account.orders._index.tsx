import {Link, useLoaderData, type MetaFunction} from 'react-router';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
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
    <div className="orders">
      {orders.nodes.length ? <OrdersTable orders={orders} /> : <EmptyOrders />}
    </div>
  );
}

function OrdersTable({orders}: Pick<CustomerOrdersFragment, 'orders'>) {
  return (
    <div className="account-orders pr-0 md:pr-[40px]">
      <p className="typo-body-l mb-6 md:mb-12">Order History</p>
      {orders?.nodes.length ? (
        <>
          {/* Mobile view - Cards */}
          <div className="md:hidden">
            <OrderList orders={orders} />
          </div>

          {/* Desktop view - Table */}
          <div className="hidden md:block">
            <OrderTable orders={orders} />
          </div>
        </>
      ) : (
        <EmptyOrders />
      )}
    </div>
  );
}

function EmptyOrders() {
  return (
    <div>
      <p>You haven&apos;t placed any orders yet.</p>
      <br />
      <p>
        <Link to="/collections">Start Shopping →</Link>
      </p>
    </div>
  );
}

// Mobile view - List of order cards
function OrderList({orders}: Pick<CustomerOrdersFragment, 'orders'>) {
  return (
    <div className="flex flex-col gap-4">
      <PaginatedResourceSection
        connection={orders}
        resourcesClassName="space-y-12"
      >
        {({node: order}) => <OrderCard key={order.id} order={order} />}
      </PaginatedResourceSection>

      {/* Pagination controls */}
      {/* <div className="flex justify-center mt-6">
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
      </div> */}
    </div>
  );
}

// Mobile view - Individual order card
function OrderCard({order}: {order: OrderItemFragment}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  const orderLink = `/account/orders/${btoa(order.id)}`;
  const orderDate = new Date(order.processedAt).toLocaleDateString();

  return (
    <div>
      <div className="pb-4 mb-6 space-y-2 border-b border-black">
        <div className="flex justify-between items-center">
          <p className="typo-caption-responsive">ORDER NUMBER</p>
          <p>#{order.number}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="typo-caption-responsive">DATE</p>
          <p>{orderDate}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="typo-caption-responsive">PAYMENT STATUS</p>
          <p>{order.financialStatus}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="typo-caption-responsive">FULFILLMENT STATUS</p>
          <p>{fulfillmentStatus || '-'}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="typo-caption-responsive">TOTAL</p>
          <p>
            <Money data={order.totalPrice} />
          </p>
        </div>
      </div>
      <Link to={orderLink} className="block">
        <Button className="w-full rounded-none">VIEW ORDER</Button>
      </Link>
    </div>
  );
}

// Desktop view - Table layout
function OrderTable({orders}: Pick<CustomerOrdersFragment, 'orders'>) {
  return (
    <div>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-3 text-center font-medium">ORDER NUMBER</th>
              <th className="py-3 text-center font-medium">DATE</th>
              <th className="py-3 text-center font-medium">PAYMENT STATUS</th>
              <th className="py-3 text-center font-medium">
                FULFILMENT STATUS
              </th>
              <th className="py-3 text-center font-medium">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <PaginatedResourceSection connection={orders} noWrapper={true}>
              {({node: order}) => <OrderRow key={order.id} order={order} />}
            </PaginatedResourceSection>
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex justify-center mt-4">
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

function OrderRow({order}: {order: OrderItemFragment}) {
  const fulfillmentStatus = flattenConnection(order.fulfillments)[0]?.status;
  const orderLink = `/account/orders/${btoa(order.id)}`;

  return (
    <tr
      className="border-b hover:bg-primary hover:text-white cursor-pointer transition-colors duration-200"
      onClick={() => (window.location.href = orderLink)}
    >
      <td className="py-4 text-center">
        <Link to={orderLink}>
          <span className="font-medium">#{order.number}</span>
        </Link>
      </td>
      <td className="py-4 text-center">
        {new Date(order.processedAt).toLocaleDateString()}
      </td>
      <td className="py-4 text-center">{order.financialStatus}</td>
      <td className="py-4 text-center">{fulfillmentStatus || '-'}</td>
      <td className="py-4 text-center">
        <Money data={order.totalPrice} />
      </td>
    </tr>
  );
}
