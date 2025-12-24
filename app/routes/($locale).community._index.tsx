import {Article} from '@shopify/hydrogen/storefront-api-types';
import {MetaFunction, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Suspense} from 'react';
import {Await, useLoaderData} from 'react-router';
import CommunityGrid from '~/components/blog/CommunityGrid';
import CommunityHero from '~/components/blog/CommunityHero';
import {BLOG_POSTS_BY_HANDLE_QUERY} from '~/graphql/cms/BlogPostsQuery';
import {COMMUNITY_PAGE_CMS_QUERY} from '~/graphql/cms/CommunityPageQuery';

export const meta: MetaFunction = () => {
  return [{title: 'Upbound | Community'}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {
    ...deferredData,
    ...criticalData,
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: LoaderFunctionArgs) {
  const {communityPage} = await context.storefront.query(
    COMMUNITY_PAGE_CMS_QUERY,
  );

  return {
    communityPage,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  const blogPosts = context.storefront
    .query(BLOG_POSTS_BY_HANDLE_QUERY, {
      variables: {
        handle: 'community',
      },
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });

  return {
    blogPosts,
  };
}

export default function CommunityPage() {
  const {communityPage, blogPosts} = useLoaderData<typeof loader>();

  return (
    <div className="community-page page-px page-py">
      {communityPage && <CommunityHero data={communityPage} />}

      {/* Community Grid with blog posts data */}
      <Suspense
        fallback={
          <div className="py-16 md:py-24 bg-neutral-50">
            Loading community cards...
          </div>
        }
      >
        <Await resolve={blogPosts}>
          {(blogPostsData) => {
            // Pass the articles array and community data to CommunityGrid
            return (
              <CommunityGrid
                title={communityPage?.grid_title?.value}
                description={communityPage?.grid_description?.value}
                articles={blogPostsData?.blog?.articles?.nodes as Article[]}
              />
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}
