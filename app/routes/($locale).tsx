import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {checkPasswordProtection} from '~/lib/passwordProtection';

export async function loader({params, context, request}: LoaderFunctionArgs) {
  const {language, country} = context.storefront.i18n;

  if (
    params.locale &&
    params.locale.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // If the locale URL param is defined, yet we still are still at the default locale
    // then the the locale param must be invalid, send to the 404 page
    throw new Response(null, {status: 404});
  }

  // only check if env has password value
  if (context.env.STORE_PASSWORD) {
    // Check if the user has access to the store
    await checkPasswordProtection(request);
  }

  return null;
}
