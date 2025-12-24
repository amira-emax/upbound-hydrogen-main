import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';
import {FAQ_PAGE_CMS_QUERY} from '~/graphql/cms/FaqPageQuery';
import ModuleRenderer from '~/components/cms/ModuleRenderer';

export const meta: MetaFunction<typeof loader> = () => {
  return [{title: 'Frequently Asked Questions | Hydrogen'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;

  const {faqPage} = await storefront.query(FAQ_PAGE_CMS_QUERY);

  if (!faqPage) {
    throw new Response('FAQ page content not found', {status: 404});
  }

  return {faqPage};
}

export default function FaqPage() {
  const {faqPage} = useLoaderData<typeof loader>();

  // Extract accordion modules from the content
  const accordionModules = faqPage?.contents?.references?.nodes || [];

  return (
    <div className="faq">
      <h1 className="text-3xl font-bold mb-12 text-center">FAQ</h1>
      <ModuleRenderer
        modules={accordionModules}
        accordionClassName="mb-6 mt-0"
      />
    </div>
  );
}
