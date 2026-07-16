import { type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { useLoaderData, type MetaFunction } from 'react-router';
import { STORE_LOCATOR_PAGE_CMS_QUERY } from '~/graphql/cms/StoreLocatorPageQuery';
import HeroImageMultiText from '~/components/cms/HeroImageMultiText';
import StoreLocatorCategory from '~/components/cms/StoreLocatorCategory';

export const meta: MetaFunction<typeof loader> = () => {
  return [{ title: 'Upbound | Where To Fuel' }];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const { storefront } = context;

  const { storeLocatorPage } = await storefront.query(STORE_LOCATOR_PAGE_CMS_QUERY);

  if (!storeLocatorPage) {
    throw new Response('Store locator page content not found', { status: 404 });
  }

  return { storeLocatorPage };
}

export default function StoreLocatorPage() {
  const { storeLocatorPage } = useLoaderData<typeof loader>();

  const categories = storeLocatorPage?.category?.references?.nodes ?? [];

  return (
    <div className="storeLocator">
      {storeLocatorPage?.hero?.reference && (
        <HeroImageMultiText reference={storeLocatorPage.hero.reference} />
      )}

      <div className="py-12 md:py-20 px-12 md:px-20">
        {categories.map((category, index) => (
          <StoreLocatorCategory key={category.id ?? index} reference={category} />
        ))}
      </div>
    </div>
  );
}
