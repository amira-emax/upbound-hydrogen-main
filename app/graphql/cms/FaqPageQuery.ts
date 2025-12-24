import {ACCORDION_FRAGMENT} from './ModuleFragments';

export const FAQ_PAGE_CMS_QUERY = `#graphql
  ${ACCORDION_FRAGMENT}
  query FaqPageCms {
    faqPage: metaobject(handle: {handle: "faq-page", type: "faq_page"}) {
      id
      handle
      contents: field(key: "contents") {
        references(first: 20) {
          nodes {
            ... on Metaobject {
              id
              type
                ...Accordion
            }
          }
        }
      }
    }
  }
` as const;
