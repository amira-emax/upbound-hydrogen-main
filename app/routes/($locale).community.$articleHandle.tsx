import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import HtmlContentBlock from '~/components/blog/HtmlContentBlock';
import {BLOG_ARTICLE_QUERY} from '~/graphql/cms/BlogPostsQuery';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Upbound | ${data?.article.title ?? ''} - Community`}];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({
  context,
  request,
  params,
}: LoaderFunctionArgs) {
  const {articleHandle} = params;

  if (!articleHandle) {
    throw new Response('Not found', {status: 404});
  }

  // Use hardcoded 'community' blog handle
  const blogHandle = 'community';

  const [{blog}] = await Promise.all([
    context.storefront.query(BLOG_ARTICLE_QUERY, {
      variables: {blogHandle, articleHandle},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articleByHandle) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(
    request,
    {
      handle: articleHandle,
      data: blog.articleByHandle,
    },
    {
      handle: blogHandle,
      data: blog,
    },
  );

  const article = blog.articleByHandle;

  return {article};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export default function CommunityArticle() {
  const {article} = useLoaderData<typeof loader>();

  const {title, image, contentHtml, author} = article;

  const publishedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

  return (
    <div>
      <Image
        data={image ?? undefined}
        className="hidden lg:block w-full h-[500px] md:h-[600px] lg:h-[700px] object-cover rounded-b-3xl"
        draggable={false}
        sizes="100vw"
      />
      <div className="max-w-5xl mx-auto page-py page-px">
        {/* Article Content */}
        <article className="prose prose-invert prose-lg max-w-none">
          <HtmlContentBlock contentHtml={contentHtml} />
        </article>
      </div>
    </div>
  );
}
