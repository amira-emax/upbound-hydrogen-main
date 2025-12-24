import type {CustomerFragment} from 'types/customer-accountapi.generated';
import type {CustomerUpdateInput} from '@shopify/hydrogen/customer-account-api-types';
import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  type MetaFunction,
} from 'react-router';
import {Button} from '~/components/ui/button';

export type ActionResponse = {
  error: string | null;
  customer: CustomerFragment | null;
};

export const meta: MetaFunction = () => {
  return [{title: 'Profile'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: ActionFunctionArgs) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const customer: CustomerUpdateInput = {};
    const validInputKeys = ['firstName', 'lastName'] as const;
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key as any)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key as (typeof validInputKeys)[number]] = value;
      }
    }

    // update customer and possibly password
    const {data, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!data?.customerUpdate?.customer) {
      throw new Error('Customer profile update failed.');
    }

    return {
      error: null,
      customer: data?.customerUpdate?.customer,
    };
  } catch (error: any) {
    return data(
      {error: error.message, customer: null},
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext<{customer: CustomerFragment}>();
  const {state} = useNavigation();
  const action = useActionData<ActionResponse>();
  const customer = action?.customer ?? account?.customer;

  return (
    <div className="account-profile">
      <p className="typo-body-l mb-6 md:mb-12">Account information</p>
      <Form method="PUT">
        <fieldset className="space-y-6">
          <div className="space-y-2 [&>*]:block">
            <label htmlFor="firstName" className="typo-caption-responsive">
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="First name"
              aria-label="First name"
              defaultValue={customer.firstName ?? ''}
              minLength={2}
              className="typo-p"
            />
          </div>
          <div className="space-y-2 [&>*]:block">
            <label htmlFor="lastName" className="typo-caption-responsive">
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Last name"
              aria-label="Last name"
              defaultValue={customer.lastName ?? ''}
              minLength={2}
              className="typo-p"
            />
          </div>
          <div className="space-y-2 [&>*]:block">
            <label htmlFor="email" className="typo-caption-responsive">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              aria-label="Email"
              defaultValue={customer.emailAddress?.emailAddress ?? ''}
              readOnly
              className="typo-p"
            />
          </div>
          <div className="space-y-2 [&>*]:block">
            <label htmlFor="phone" className="typo-caption-responsive">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="phone"
              placeholder="Phone"
              aria-label="Phone"
              defaultValue={customer.phoneNumber?.phoneNumber ?? ''}
              className="typo-p"
            />
          </div>
          <div className="space-y-2">
            <p className="typo-caption-responsive">Address</p>
            <div>
              {customer.defaultAddress?.formatted ? (
                customer.defaultAddress.formatted.map((line, index) => (
                  <p key={index}>{line}</p>
                ))
              ) : (
                <p>No default address set.</p>
              )}
            </div>
          </div>

          {action?.error && (
            <p className="typo-caption-responsive">{action.error}</p>
          )}

          <Button
            type="submit"
            disabled={state !== 'idle'}
            className="w-full md:w-fit rounded-none"
          >
            {state !== 'idle' ? 'Updating' : 'Update'}
          </Button>
        </fieldset>
      </Form>
    </div>
  );
}
