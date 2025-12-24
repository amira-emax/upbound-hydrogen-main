import {Image, Money, flattenConnection} from '@shopify/hydrogen';
import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import type {OrderLineItemFullFragment} from 'types/customer-accountapi.generated';
import {ArrowLeft} from 'lucide-react';
import {Link, MetaFunction, useLoaderData} from 'react-router';
import {Button} from '~/components/ui/button';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

export async function loader({params, context}: LoaderFunctionArgs) {
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_ORDER_QUERY,
    {
      variables: {orderId},
    },
  );

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  const lineItems = flattenConnection(order.lineItems);
  const discountApplications = flattenConnection(order.discountApplications);

  const fulfillmentStatus =
    flattenConnection(order.fulfillments)[0]?.status ?? 'N/A';

  const firstDiscount = discountApplications[0]?.value;

  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' && firstDiscount;

  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue' &&
    firstDiscount?.percentage;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

// Define the loader return type using the generated types
type LoaderReturnType = {
  order: any; // Using any for now to avoid type conflicts
  lineItems: OrderLineItemFullFragment[];
  discountValue: any | null | false; // Using any for MoneyV2 type
  discountPercentage: number | null | false;
  fulfillmentStatus: string;
};

export default function OrderRoute() {
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData<typeof loader>() as unknown as LoaderReturnType;
  return (
    <div className="account-order">
      <div className="mb-8 md:mb-12">
        <Link
          to="/account/orders"
          aria-label="Back to orders"
          className="hidden md:block"
        >
          <Button variant="link" className="!p-0 !h-fit">
            <ArrowLeft />
            <p>Back to Orders</p>
          </Button>
        </Link>
        <div className="flex gap-4 items-center">
          <h2 className="typo-body-l">Order {order.name}</h2>
          <div className="flex items-center">
            <StatusBadge status={fulfillmentStatus} />
          </div>
        </div>
        <p className="typo-caption-responsive">
          Placed on {new Date(order.processedAt!).toDateString()}
        </p>
      </div>

      <div className="space-y-8">
        <OrderDetailsContent
          order={order}
          lineItems={lineItems}
          discountValue={discountValue}
          discountPercentage={discountPercentage}
        />
        <div>
          <h3 className="font-medium mb-2">Shipping Address</h3>
          {order?.shippingAddress ? (
            <div>
              <p>{order.shippingAddress.name}</p>
              {order.shippingAddress.formatted ? (
                <p>{order.shippingAddress.formatted}</p>
              ) : (
                ''
              )}
              {order.shippingAddress.formattedArea ? (
                <p>{order.shippingAddress.formattedArea}</p>
              ) : (
                ''
              )}
            </div>
          ) : (
            <p>No shipping address defined</p>
          )}
        </div>
        <Link
          to="/account/orders"
          aria-label="Back to orders"
          className="block md:hidden"
        >
          <Button className="rounded-none w-full">Back</Button>
        </Link>
      </div>
    </div>
  );
}

// Main component for order details content with responsive design
// Define types for the component props
type OrderDetailsContentProps = {
  order: any; // Using any for now to avoid type conflicts
  lineItems: OrderLineItemFullFragment[];
  discountValue: any | null | false; // Using any for MoneyV2 type
  discountPercentage: number | null | false;
};

function OrderDetailsContent({
  order,
  lineItems,
  discountValue,
  discountPercentage,
}: OrderDetailsContentProps) {
  return (
    <>
      {/* Mobile view */}
      <div className="md:hidden">
        <div className="space-y-8">
          {/* Product line items */}
          <div className="space-y-4">
            {lineItems.map((lineItem, index) => (
              <ProductLineCard key={index} lineItem={lineItem} />
            ))}
          </div>
          {/* Order summary */}
          <OrderSummaryCard
            order={order}
            discountValue={discountValue}
            discountPercentage={discountPercentage}
          />
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th scope="col" className="py-3 text-left font-medium">
                Product
              </th>
              <th scope="col" className="py-3 text-center font-medium">
                Price
              </th>
              <th scope="col" className="py-3 text-center font-medium">
                Quantity
              </th>
              <th scope="col" className="py-3 text-center font-medium">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((lineItem, lineItemIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <OrderLineRow key={lineItemIndex} lineItem={lineItem} />
            ))}
          </tbody>
          <tfoot className="border-t">
            {((discountValue && discountValue.amount) ||
              discountPercentage) && (
              <tr>
                <th scope="row" colSpan={3} className="pt-4 pb-2 text-left">
                  <p className="font-medium">Discounts</p>
                </th>
                <td className="py-2 text-center">
                  {discountPercentage ? (
                    <span>-{discountPercentage}% OFF</span>
                  ) : (
                    discountValue && (
                      <div className="flex justify-center">
                        RM <Money data={discountValue!} withoutCurrency />
                      </div>
                    )
                  )}
                </td>
              </tr>
            )}
            <tr>
              <th scope="row" colSpan={3} className="py-2 text-left">
                <p className="font-medium">Subtotal</p>
              </th>
              <td className="py-2 text-center">
                <div className="flex justify-center">
                  RM <Money data={order.subtotal!} withoutCurrency />
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row" colSpan={3} className="py-2 text-left">
                <p className="font-medium">Tax</p>
              </th>
              <td className="py-2 text-center">
                <div className="flex justify-center">
                  RM <Money data={order.totalTax!} withoutCurrency />
                </div>
              </td>
            </tr>
            <tr className="border-t">
              <th scope="row" colSpan={3} className="py-4 text-left">
                <p className="font-medium">Total</p>
              </th>
              <td className="py-4 text-center">
                <div className="flex justify-center">
                  RM <Money data={order.totalPrice!} withoutCurrency />
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}

// Mobile view - Individual product line card
// Define type for ProductLineCard props
type ProductLineCardProps = {
  lineItem: OrderLineItemFullFragment;
};

function ProductLineCard({lineItem}: ProductLineCardProps) {
  return (
    <div className="border-b pb-4">
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <p className="typo-caption-responsive-uppercase">PRODUCT</p>
          <div>
            {lineItem?.image && (
              <div className="w-20 h-20 flex-shrink-0 justify-self-end mb-2">
                <Image
                  data={lineItem.image}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            )}
            <p className="typo-caption-responsive">{lineItem.title}</p>
          </div>
        </div>
        <div className="flex justify-between">
          <p className="typo-caption-responsive-uppercase">SKU</p>
          <p className="typo-caption-responsive">
            {lineItem.variantTitle || '-'}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="typo-caption-responsive-uppercase">PRICE</p>
          <div className="flex items-center typo-caption-responsive">
            RM <Money data={lineItem.price!} withoutCurrency />
          </div>
        </div>
        <div className="flex justify-between">
          <p className="typo-caption-responsive-uppercase">QUANTITY</p>
          <p className="typo-caption-responsive">{lineItem.quantity}</p>
        </div>
      </div>
    </div>
  );
}

// Mobile view - Order summary card
// Define type for OrderSummaryCard props
type OrderSummaryCardProps = {
  order: any; // Using any for now to avoid type conflicts
  discountValue: any | null | false; // Using any for MoneyV2 type
  discountPercentage: number | null | false;
};

function OrderSummaryCard({
  order,
  discountValue,
  discountPercentage,
}: OrderSummaryCardProps) {
  return (
    <div className="space-y-4">
      <p className="typo-body-l mb-8">Order Summary</p>
      <div className="space-y-2">
        {/* Discount row if applicable */}
        {((discountValue && discountValue.amount) || discountPercentage) && (
          <div className="flex justify-between items-center">
            <p className="typo-caption-responsive">DISCOUNTS</p>
            <p>
              {discountPercentage ? (
                <span>-{discountPercentage}% OFF</span>
              ) : (
                discountValue && (
                  <div className="flex items-center">
                    RM <Money data={discountValue!} withoutCurrency />
                  </div>
                )
              )}
            </p>
          </div>
        )}
        {/* Subtotal row */}
        <div className="flex justify-between items-center">
          <p className="typo-caption-responsive">SUBTOTAL</p>
          <div className="flex items-center">
            RM <Money data={order.subtotal!} withoutCurrency />
          </div>
        </div>
        {/* Tax row */}
        <div className="flex justify-between items-center">
          <p className="typo-caption-responsive">TAX</p>
          <div className="flex items-center">
            RM <Money data={order.totalTax!} withoutCurrency />
          </div>
        </div>
        {/* Total row */}
        <div className="flex justify-between items-center pt-2 border-t">
          <p className="typo-caption-responsive font-medium">TOTAL</p>
          <div className="flex items-center font-medium">
            RM <Money data={order.totalPrice!} withoutCurrency />
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderLineRow({lineItem}: {lineItem: OrderLineItemFullFragment}) {
  return (
    <tr key={lineItem.id} className="border-b">
      <td className="py-4">
        <div className="flex gap-4 items-center">
          {lineItem?.image && (
            <div className="w-16 h-16 flex-shrink-0">
              <Image
                data={lineItem.image}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <p className="font-medium">{lineItem.title}</p>
            <small className="text-gray-500">{lineItem.variantTitle}</small>
          </div>
        </div>
      </td>
      <td className="py-4">
        <div className="flex justify-center items-center">
          RM
          <Money data={lineItem.price!} withoutCurrency />
        </div>
      </td>
      <td className="py-4 text-center">{lineItem.quantity}</td>
      <td className="py-4">
        <div className="flex justify-center items-center">
          RM
          <Money data={lineItem.totalDiscount!} withoutCurrency />
        </div>
      </td>
    </tr>
  );
}

function StatusBadge({status}: {status: string | null}) {
  let badgeClass = '';
  let statusText = status || 'Processing';

  switch (status?.toLowerCase()) {
    case 'fulfilled':
      badgeClass = 'bg-green-100 text-green-800';
      break;
    case 'delivered':
      badgeClass = 'bg-green-500 text-white';
      break;
    case 'in_progress':
    case 'in progress':
      badgeClass = 'bg-blue-100 text-blue-800';
      statusText = 'In Progress';
      break;
    case 'partially_fulfilled':
    case 'partially fulfilled':
      badgeClass = 'bg-blue-100 text-blue-800';
      statusText = 'Partially Fulfilled';
      break;
    case 'unfulfilled':
      badgeClass = 'bg-yellow-100 text-yellow-800';
      break;
    case 'restocked':
      badgeClass = 'bg-red-100 text-red-800';
      break;
    case 'pending':
      badgeClass = 'bg-gray-100 text-gray-800';
      break;
    case 'cancelled':
      badgeClass = 'bg-red-100 text-red-800';
      break;
    default:
      badgeClass = 'bg-gray-100 text-gray-800';
      break;
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${badgeClass}`}
    >
      {statusText}
    </span>
  );
}
