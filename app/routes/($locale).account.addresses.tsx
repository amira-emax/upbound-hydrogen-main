import type {
  CustomerAddress,
  CustomerAddressInput,
} from '@shopify/hydrogen/customer-account-api-types';
import type {
  AddressFragment,
  CustomerFragment,
} from 'types/customer-accountapi.generated';
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
  type Fetcher,
} from 'react-router';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';
import {Button} from '~/components/ui/button';
import {useEffect, useState} from 'react';
import {countries, Country} from '~/lib/countries';
import {MapPin} from 'lucide-react';
import {cn} from '~/lib/utils';

export type ActionResponse = {
  addressId?: string | null;
  createdAddress?: AddressFragment;
  defaultAddress?: string | null;
  deletedAddress?: string | null;
  error: Record<AddressFragment['id'], string> | null;
  updatedAddress?: AddressFragment;
};

export const meta: MetaFunction = () => {
  return [{title: 'Addresses'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: ActionFunctionArgs) {
  const {customerAccount} = context;

  try {
    const form = await request.formData();

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;
    if (!addressId) {
      throw new Error('You must provide an address id.');
    }

    // this will ensure redirecting to login never happen for mutatation
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data(
        {error: {[addressId]: 'Unauthorized'}},
        {
          status: 401,
        },
      );
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;
    const address: CustomerAddressInput = {};
    const keys: (keyof CustomerAddressInput)[] = [
      'address1',
      'address2',
      'city',
      'territoryCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'zoneCode',
      'zip',
    ];

    for (const key of keys) {
      const value = form.get(key);
      if (typeof value === 'string') {
        address[key] = value;
      }
    }

    switch (request.method) {
      case 'POST': {
        // handle new address creation
        try {
          const {data, errors} = await customerAccount.mutate(
            CREATE_ADDRESS_MUTATION,
            {
              variables: {address, defaultAddress},
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressCreate?.userErrors?.length) {
            throw new Error(data?.customerAddressCreate?.userErrors[0].message);
          }

          if (!data?.customerAddressCreate?.customerAddress) {
            throw new Error('Customer address create failed.');
          }

          return {
            error: null,
            createdAddress: data?.customerAddressCreate?.customerAddress,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'PUT': {
        // handle address updates
        try {
          const {data, errors} = await customerAccount.mutate(
            UPDATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressUpdate?.userErrors?.length) {
            throw new Error(data?.customerAddressUpdate?.userErrors[0].message);
          }

          if (!data?.customerAddressUpdate?.customerAddress) {
            throw new Error('Customer address update failed.');
          }

          return {
            error: null,
            updatedAddress: address,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'DELETE': {
        // handles address deletion
        try {
          const {data, errors} = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: {addressId: decodeURIComponent(addressId)},
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressDelete?.userErrors?.length) {
            throw new Error(data?.customerAddressDelete?.userErrors[0].message);
          }

          if (!data?.customerAddressDelete?.deletedAddressId) {
            throw new Error('Customer address delete failed.');
          }

          return {error: null, deletedAddress: addressId};
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      default: {
        return data(
          {error: {[addressId]: 'Method not allowed'}},
          {
            status: 405,
          },
        );
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return data(
        {error: error.message},
        {
          status: 400,
        },
      );
    }
    return data(
      {error},
      {
        status: 400,
      },
    );
  }
}

export default function Addresses() {
  const {customer} = useOutletContext<{customer: CustomerFragment}>();
  const {defaultAddress, addresses} = customer;

  return (
    <div className="account-addresses max-w-xl">
      <ExistingAddresses
        addresses={addresses}
        defaultAddress={defaultAddress}
      />
    </div>
  );
}

function NewAddressForm({
  setNewAddress,
}: {
  setNewAddress: (newAddress: boolean) => void;
}) {
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    territoryCode: '',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  } as CustomerAddressInput;

  return (
    <div className="space-y-6">
      <h2 className="typo-body-l">New Address</h2>
      <AddressForm
        addressId={'NEW_ADDRESS_ID'}
        address={newAddress}
        defaultAddress={null}
      >
        {({stateForMethod}) => (
          <div className="!flex !gap-4">
            <Button
              disabled={stateForMethod('POST') !== 'idle'}
              formMethod="POST"
              type="submit"
            >
              {stateForMethod('POST') !== 'idle' ? 'Creating' : 'Create'}
            </Button>
            <Button
              onClick={() => setNewAddress(false)}
              type="button"
              variant="link"
              className="px-0"
            >
              Cancel
            </Button>
          </div>
        )}
      </AddressForm>
    </div>
  );
}

function ExistingAddresses({
  addresses,
  defaultAddress,
}: Pick<CustomerFragment, 'addresses' | 'defaultAddress'>) {
  const [selectedAddress, setSelectedAddress] =
    useState<CustomerAddress | null>(null);
  const [newAddress, setNewAddress] = useState<boolean>(false);
  const actionData = useActionData<ActionResponse>();

  // Reset states when an action is completed successfully
  useEffect(() => {
    if (actionData) {
      // Check if any successful action happened
      if (
        (actionData.createdAddress && !actionData.error) ||
        (actionData.updatedAddress && !actionData.error) ||
        (actionData.deletedAddress && !actionData.error)
      ) {
        // Reset both states
        setSelectedAddress(null);
        setNewAddress(false);
      }
    }
  }, [actionData]);

  if (newAddress && !selectedAddress)
    return <NewAddressForm setNewAddress={setNewAddress} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="typo-h2">Addresses</h2>
        {!selectedAddress && (
          <Button size="sm" className="rounded-xl" onClick={() => setNewAddress(true)}>
            Add
          </Button>
        )}
      </div>
      {selectedAddress ? (
        <AddressForm
          key={selectedAddress.id}
          addressId={selectedAddress.id}
          address={selectedAddress}
          defaultAddress={defaultAddress}
        >
          {({stateForMethod}) => (
            <div className="!flex !gap-4 *:nth-3:flex-1">
              <Button
                disabled={stateForMethod('PUT') !== 'idle'}
                formMethod="PUT"
                type="submit"
              >
                {stateForMethod('PUT') !== 'idle' ? 'Saving' : 'Save'}
              </Button>
              <Button
                onClick={() => setSelectedAddress(null)}
                disabled={stateForMethod('PUT') !== 'idle'}
                type="button"
                variant="link"
                className="px-0"
              >
                Cancel
              </Button>
              <div />
              <Button
                disabled={stateForMethod('DELETE') !== 'idle'}
                formMethod="DELETE"
                type="submit"
                variant="destructive"
              >
                {stateForMethod('DELETE') !== 'idle' ? 'Deleting' : 'Delete'}
              </Button>
            </div>
          )}
        </AddressForm>
      ) : addresses.nodes.length ? (
        <div className="space-y-3">
          {addresses.nodes.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isDefault={address.id === defaultAddress?.id}
              onClick={() => setSelectedAddress(address)}
            />
          ))}
        </div>
      ) : (
        <EmptyAddressCard />
      )}
    </div>
  );
}

function EmptyAddressCard() {
  return (
    <div className="flex w-full items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-mid-grey">
        <MapPin className="size-5" />
      </span>
      <span className="typo-caption-responsive text-mid-grey">
        No addresses added
      </span>
    </div>
  );
}

export function AddressForm({
  addressId,
  address,
  defaultAddress,
  children,
}: {
  addressId: AddressFragment['id'];
  address: CustomerAddressInput;
  defaultAddress: CustomerFragment['defaultAddress'];
  children: (props: {
    stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
  }) => React.ReactNode;
}) {
  const {state, formMethod} = useNavigation();
  const action = useActionData<ActionResponse>();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;

  return (
    <Form id={addressId}>
      <fieldset className="space-y-4 **:block **:space-y-2">
        <input type="hidden" name="addressId" defaultValue={addressId} />
        <div className="!flex !flex-col md:!flex-row !gap-4 *:!flex-1 !space-y-0">
          <div>
            <label htmlFor="firstName">First name*</label>
            <input
              aria-label="First name"
              autoComplete="given-name"
              defaultValue={address?.firstName ?? ''}
              id="firstName"
              name="firstName"
              placeholder="First name"
              required
              type="text"
              className="address-input"
            />
          </div>
          <div>
            <label htmlFor="lastName">Last name*</label>
            <input
              aria-label="Last name"
              autoComplete="family-name"
              defaultValue={address?.lastName ?? ''}
              id="lastName"
              name="lastName"
              placeholder="Last name"
              required
              type="text"
              className="address-input"
            />
          </div>
        </div>
        <div>
          <label htmlFor="address1">Address line*</label>
          <input
            aria-label="Address line 1"
            autoComplete="address-line1"
            defaultValue={address?.address1 ?? ''}
            id="address1"
            name="address1"
            placeholder="Address line 1*"
            required
            type="text"
            className="address-input"
          />
        </div>
        <div>
          <label htmlFor="address2">Address line 2</label>
          <input
            aria-label="Address line 2"
            autoComplete="address-line2"
            defaultValue={address?.address2 ?? ''}
            id="address2"
            name="address2"
            placeholder="Address line 2"
            type="text"
            className="address-input"
          />
        </div>
        <div className="!flex !gap-4 *:!flex-1 !space-y-0">
          <div>
            <label htmlFor="city">City*</label>
            <input
              aria-label="City"
              autoComplete="address-level2"
              defaultValue={address?.city ?? ''}
              id="city"
              name="city"
              placeholder="City"
              required
              type="text"
              className="address-input"
            />
          </div>
          <div>
            <label htmlFor="zoneCode">State / Province*</label>
            <input
              aria-label="State/Province"
              autoComplete="address-level1"
              defaultValue={address?.zoneCode ?? ''}
              id="zoneCode"
              name="zoneCode"
              placeholder="State / Province"
              required
              type="text"
              className="address-input"
            />
          </div>
        </div>
        <div className="!flex !gap-4 *:!flex-1 !space-y-0">
          <div>
            <label htmlFor="zip">Zip / Postal Code*</label>
            <input
              aria-label="Zip"
              autoComplete="postal-code"
              defaultValue={address?.zip ?? ''}
              id="zip"
              name="zip"
              placeholder="Zip / Postal Code"
              required
              type="text"
              className="address-input"
            />
          </div>
          <div>
            <label htmlFor="territoryCode">Country*</label>
            <select
              aria-label="Country"
              autoComplete="country"
              defaultValue={address?.territoryCode ?? 'MY'}
              id="territoryCode"
              name="territoryCode"
              required
              className="address-input"
            >
              {countries.map((country: Country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="phoneNumber">Phone</label>
          <input
            aria-label="Phone Number"
            autoComplete="tel"
            defaultValue={address?.phoneNumber ?? ''}
            id="phoneNumber"
            name="phoneNumber"
            placeholder="+16135551111"
            pattern="^\+?[1-9]\d{3,14}$"
            type="tel"
            className="address-input"
          />
        </div>
        <div className="!flex !gap-2 !space-y-0 !item-center">
          <input
            defaultChecked={isDefaultAddress}
            id="defaultAddress"
            name="defaultAddress"
            type="checkbox"
          />
          <label htmlFor="defaultAddress">Set as default address</label>
        </div>
        {error && (
          <p>
            <mark>
              <small>{error}</small>
            </mark>
          </p>
        )}
        {children({
          stateForMethod: (method) => (formMethod === method ? state : 'idle'),
        })}
      </fieldset>
    </Form>
  );
}

export function AddressCard({
  address,
  isDefault,
  onClick,
}: {
  address: CustomerAddress;
  isDefault?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4 text-left shadow-sm transition-colors',
        'hover:border-neutral-400',
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-mid-grey">
        <MapPin className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="typo-body-l block truncate">
          {address.firstName} {address.lastName}
          {isDefault && (
            <span className="typo-caption-responsive text-mid-grey"> (Default)</span>
          )}
        </span>
        <span className="typo-caption-responsive text-mid-grey block truncate">
          {address.phoneNumber || 'No phone number added'}
        </span>
      </span>
    </button>
  );
}
