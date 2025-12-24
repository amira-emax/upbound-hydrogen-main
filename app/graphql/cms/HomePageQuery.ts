import {
  HERO_WITH_CTA_FRAGMENT,
  TEXT_WITH_CTA_FRAGMENT,
  IMAGE_CAROUSEL_FRAGMENT,
  ACCORDION_FRAGMENT,
  HERO_FEATURED_PRODUCT_FRAGMENT,
  HERO_IMAGE_WITH_PRODUCT,
} from './ModuleFragments';

export const HOME_PAGE_CMS_QUERY = `#graphql
  ${HERO_WITH_CTA_FRAGMENT}
  ${TEXT_WITH_CTA_FRAGMENT}
  ${IMAGE_CAROUSEL_FRAGMENT}
  ${ACCORDION_FRAGMENT}
  ${HERO_FEATURED_PRODUCT_FRAGMENT}
  ${HERO_IMAGE_WITH_PRODUCT}
  
  query HomePageCms {
    homePage: metaobject(handle: {handle: "home-page", type: "home_page"}) {
      id
      handle
      modules: field(key: "modules") {
        references(first: 10) {
          nodes {
            ... on Metaobject {
              id
              type
                # Use fragments for each module type
                ...HeroWithCta
                ...TextWithCta
                ...ImageCarousel
                ...Accordion
                ...HeroFeaturedProduct
                ...HeroImageWithProduct
            }
          }
        }
      }
    }
  }
` as const;
