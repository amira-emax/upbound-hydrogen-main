import type {MetaFunction, LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData} from 'react-router';
import {
  OUR_STORY_PAGE_CMS_QUERY,
  FOUNDER_BLOG_POST_QUERY,
} from '~/graphql/cms/OurStoryPageQuery';
import HeroAccordion from '~/components/cms/HeroAccordion';
import HeroImage from '~/components/cms/HeroImage';
import HeroQuote from '~/components/cms/HeroQuote';
import ImageGallery from '~/components/cms/ImageGallery';
import FounderCard from '~/components/cms/FounderCard';
import {Image} from '@shopify/hydrogen/storefront-api-types';

export const meta: MetaFunction = ({data}: {data: any}) => {
  return [{title: data?.ourStoryPage?.title?.value || 'Upbound | Our Story'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  const [pageData, blogData] = await Promise.all([
    context.storefront.query(OUR_STORY_PAGE_CMS_QUERY),
    context.storefront.query(FOUNDER_BLOG_POST_QUERY),
  ]);

  const {ourStoryPage} = pageData;
  const {blog} = blogData;

  // If we don't have the page data, return a 404
  if (!ourStoryPage) {
    throw new Response('Not found', {status: 404});
  }

  return {
    ourStoryPage,
    founderBlog: blog?.articleByHandle || null,
  };
}

export default function OurStory() {
  const {ourStoryPage, founderBlog} = useLoaderData<typeof loader>();

  // Find the accordion module in the modules array
  const accordionModule = ourStoryPage?.modules?.references?.nodes?.find(
    (module: {type: string}) => module.type === 'accordion',
  );

  return (
    <div className="our-story page-px page-py">
      <HeroImage
        title={ourStoryPage.title?.value || ''}
        desktopImage={
          (ourStoryPage.desktopImage?.reference?.image as Image) ?? undefined
        }
        mobileImage={
          (ourStoryPage.mobileImage?.reference?.image as Image) ?? undefined
        }
      />
      <HeroQuote
        description={ourStoryPage.founderQuote?.value || ''}
        caption={ourStoryPage.quoteCaption?.value || ''}
      />
      <FounderCard
        founder={ourStoryPage.founderCard?.reference as any}
        blogPost={founderBlog}
      />
      <ImageGallery gallery={ourStoryPage.gallery?.references?.nodes as any} />
      {accordionModule && (
        <HeroAccordion reference={accordionModule} className="mt-0" />
      )}
    </div>
  );
}
