export const BLOG_POSTS_BY_HANDLE_QUERY = `#graphql
query BlogPostsByHandle($handle: String!) {
  blog(handle: $handle) {
    articles(first: 25) {
      nodes {
        id
        handle
        title
        excerpt
        contentHtml
        image {
          height
          width
          url
          altText
        }
        tags
        caption: metafield(key: "caption", namespace: "custom") {
          type
          value
        }
      }
    }
  }
}` as const;

export const BLOG_ARTICLE_QUERY = `#graphql
  query BlogArticle(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      articleByHandle(handle: $articleHandle) {
        handle
        title
        contentHtml
        publishedAt
        author: authorV2 {
          name
        }
        author_name: metafield(
          key: "author_name"
          namespace: "custom"
        ) {
          value
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
        tags
        excerpt
        caption: metafield(key: "caption", namespace: "custom") {
          type
          value
        }
      }
    }
  }
` as const;
