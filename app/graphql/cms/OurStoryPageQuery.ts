import {
  ACCORDION_FRAGMENT,
  FOUNDER_CARD_FRAGMENT,
  GALLERY_IMAGE_CARD_FRAGMENT,
} from './ModuleFragments';

export const OUR_STORY_PAGE_CMS_QUERY = `#graphql
  ${ACCORDION_FRAGMENT}
  ${FOUNDER_CARD_FRAGMENT}
  ${GALLERY_IMAGE_CARD_FRAGMENT}
  
  query OurStoryPageCms {
    ourStoryPage: metaobject(handle: {handle: "our-story-page", type: "our_story_page"}) {
      id
      handle
      title: field(key: "title") {
        value
      }
      desktopImage: field(key: "desktop_hero_image") {
        reference {
          ... on MediaImage {
            image {
              height
              width
              url
              altText
            }
          }
        }
      }
      mobileImage: field(key: "mobile_hero_image") {
        reference {
          ... on MediaImage {
            image {
              height
              width
              url
              altText
            }
          }
        }
      }
      founderQuote: field(key: "founder_quote") {
        value
      }
      quoteCaption: field(key: "quote_caption") {
        value
      }
      founderCard: field(key: "founder"){
        reference {
          ... on Metaobject {
            ...FounderCard
          } 
        }
      }
      gallery: field(key: "gallery") {
        references(first: 2) {
          nodes {
            ... on Metaobject {
              id
              type
              ...GalleryImageCard
            }
          }
        }
      }
      modules: field(key: "modules") {
        references(first: 20) {
          nodes {
            ... on Metaobject {
              id
              type
                # Use fragments for each module type
                ...Accordion
            }
          }
        }
      }
    }
  }
` as const;

export const FOUNDER_BLOG_POST_QUERY = `#graphql
  query FounderBlogArticle {
    blog(handle: "founder") {
      handle
      articleByHandle(handle: "meet-the-founder") {
        title
        contentHtml
      }
    }
  }
` as const;
