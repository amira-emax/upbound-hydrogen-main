import {
  data as remixData,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {Form, NavLink, Outlet, useLoaderData} from 'react-router';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

export async function loader({context}: LoaderFunctionArgs) {
  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_DETAILS_QUERY,
  );

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>();

  // const heading = customer
  //   ? customer.firstName
  //     ? `Welcome, ${customer.firstName}`
  //     : `Welcome to your account.`
  //   : 'Account Details';

  return (
    <div className="account">
      <AccountMenu />
      <div className="flex-3">
        <Outlet context={{customer}} />
      </div>
    </div>
  );
}

function AccountMenu() {
  function isActiveStyle({
    isActive,
    isPending,
  }: {
    isActive: boolean;
    isPending: boolean;
  }) {
    return {
      color: isActive ? 'black' : undefined,
    };
  }

  return (
    <nav
      role="navigation"
      className="flex-1 space-y-3 [&>*]:block mb-12 md:mb-0 pb-6 md:pb-0 border-black border-b md:border-none"
    >
      <p className="typo-body-l mb-6">Account</p>
      <NavLink
        to="/account/profile"
        style={isActiveStyle}
        className="typo-caption-responsive text-mid-grey"
      >
        Account Details
      </NavLink>
      <NavLink
        to="/account/orders"
        style={isActiveStyle}
        className="typo-caption-responsive text-mid-grey"
      >
        Order History
      </NavLink>
      <NavLink
        to="/account/addresses"
        style={isActiveStyle}
        className="typo-caption-responsive text-mid-grey"
      >
        Addresses
      </NavLink>
      <Logout />
    </nav>
  );
}

function Logout() {
  return (
    <Form className="account-logout" method="POST" action="/account/logout">
      <button type="submit" className="typo-caption-responsive text-mid-grey">
        Logout
      </button>
    </Form>
  );
}
