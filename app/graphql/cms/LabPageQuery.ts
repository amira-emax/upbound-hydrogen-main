import {
  HERO_WITH_CTA_FRAGMENT,
  TEXT_WITH_CTA_FRAGMENT,
  IMAGE_CAROUSEL_FRAGMENT,
  ACCORDION_FRAGMENT,
  HERO_FEATURED_PRODUCT_FRAGMENT,
  HERO_IMAGE_WITH_PRODUCT,
  HERO_IMAGE_MULTI_TEXT_FRAGMENT,
  TEXT_BLOCK_FRAGMENT,
  GALLERY_IMAGE_CARD_FRAGMENT

} from './ModuleFragments';

export const LAB_PAGE_CMS_QUERY = `#graphql
   ${HERO_WITH_CTA_FRAGMENT}
    ${TEXT_WITH_CTA_FRAGMENT}
    ${IMAGE_CAROUSEL_FRAGMENT}
    ${ACCORDION_FRAGMENT}
    ${HERO_FEATURED_PRODUCT_FRAGMENT}
    ${HERO_IMAGE_WITH_PRODUCT}
    ${HERO_IMAGE_MULTI_TEXT_FRAGMENT}
    ${TEXT_BLOCK_FRAGMENT}
    ${GALLERY_IMAGE_CARD_FRAGMENT}

  query LabPageCms {
    paceLabPage: metaobject(
      handle: {type: "pace_lab_page", handle: "lab"}
    ) {
      id
      handle

      header_feature: field(key: "header_feature") { value }
      people: field(key: "people") { value }

      hero_with_text: field(key: "hero_with_text") {
          reference {
              ... on Metaobject {
                  id
                  type
                  ...HeroImageMultiText
              }
          }
      }

      text: field(key: "text") {
         reference {
          ... on Metaobject {
            ...TextBlock
          }
        }
      }

      banner: field(key: "banner") {
        reference {
              ... on Metaobject {
                  id
                  type
                  ...HeroImageMultiText
              }
          }
      } 


      description: field(key: "description") {
         reference {
          ... on Metaobject {
            ...TextBlock
          }
        }
      }
        
      join: field(key: "join") {
          reference {
              ... on Metaobject {
                  id
                  type
                  ...Accordion
              }
          }
      }

    

      question_title: field(key: "question_title") {
          reference {
              
              ... on Metaobject {
                  id
                  type
                  ...Accordion
              
              }
          }
      }

      gallery: field(key: "gallery") {
         reference {
          ... on Metaobject {
            ...GalleryImageCard
          }
        }
      }

      sign_up: field(key: "sign_up") {
         reference {
          ... on Metaobject {
            ...TextWithCta
          }
        }
      }

    



      modules: field(key: "modules") {
        references(first: 20) {
          nodes {
            ... on Metaobject {
              id
              type
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
`;
