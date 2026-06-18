import {type MetaFunction, useLoaderData} from 'react-router';
import type {CartQueryDataReturn} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {
  data,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
  type HeadersFunction,
} from '@shopify/remix-oxygen';
import {CartMain} from '~/components/CartMain';

export const meta: MetaFunction = () => {
  return [{title: `Upbound | Cart`}];
};

export const headers: HeadersFunction = ({actionHeaders}) => actionHeaders;

export async function action({request, context}: ActionFunctionArgs) {
  const {cart} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryDataReturn;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd: {
      const newLines = inputs.lines as any[];
      const newGiftLine = newLines.find((l: any) =>
        l.attributes?.some((a: any) => a.key === '_is_free_gift' && a.value === 'true'),
      );

      if (newGiftLine) {
        const newGiftVariantId = newGiftLine.merchandiseId;
        const newMainLine = newLines.find(
          (l: any) => !l.attributes?.some((a: any) => a.key === '_is_free_gift'),
        );

        // Build the full set of variant IDs in this gift family (handles multi-size gifts)
        const sizeOptionsRaw = newMainLine?.attributes?.find(
          (a: any) => a.key === '_free_gift_size_options',
        )?.value;
        const giftFamilyIds: string[] = sizeOptionsRaw
          ? (JSON.parse(sizeOptionsRaw) as {label: string; variantId: string}[]).map(
              (o) => o.variantId,
            )
          : [newGiftVariantId];

        const currentCart = await cart.get();
        const existingLines = (currentCart as any)?.lines?.nodes ?? [];

        // Find gift lines in the same family but with a different variant (e.g. old M after swap)
        const conflictingGiftLineIds: string[] = existingLines
          .filter(
            (l: any) =>
              l.attributes?.some((a: any) => a.key === '_is_free_gift' && a.value === 'true') &&
              giftFamilyIds.includes(l.merchandise.id) &&
              l.merchandise.id !== newGiftVariantId,
          )
          .map((l: any) => l.id);

        if (conflictingGiftLineIds.length > 0) {
          // Recalculate gift qty = existing main product qty + qty being added now
          const existingMainLine = newMainLine
            ? existingLines.find(
                (l: any) =>
                  l.merchandise.id === newMainLine.merchandiseId &&
                  !l.attributes?.some((a: any) => a.key === '_is_free_gift'),
              )
            : null;

          const correctedQty =
            (existingMainLine?.quantity ?? 0) + (newMainLine?.quantity ?? newGiftLine.quantity);

          const linesToAdd = newLines.map((l: any) =>
            l.attributes?.some((a: any) => a.key === '_is_free_gift' && a.value === 'true')
              ? {...l, quantity: correctedQty}
              : l,
          );

          await cart.removeLines(conflictingGiftLineIds);
          result = await cart.addLines(linesToAdd);
          break;
        }
      }

      result = await cart.addLines(inputs.lines);
      break;
    }
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesUpdate: {
      const formGiftCardCode = inputs.giftCardCode;

      // User inputted gift card code
      const giftCardCodes = (
        formGiftCardCode ? [formGiftCardCode] : []
      ) as string[];

      // Combine gift card codes already applied on cart
      giftCardCodes.push(...inputs.giftCardCodes);

      result = await cart.updateGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export async function loader({context}: LoaderFunctionArgs) {
  const {cart} = context;
  return await cart.get();
}

export default function Cart() {
  const cart = useLoaderData<typeof loader>();

  return (
    <div className="cart">
      <h1>Cart</h1>
      <CartMain layout="page" cart={cart} />
    </div>
  );
}
