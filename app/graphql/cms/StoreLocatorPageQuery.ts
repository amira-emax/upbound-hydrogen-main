import {
  STORE_LOCATOR_HERO_FRAGMENT,
  STORE_TYPE_FRAGMENT,
} from './ModuleFragments';

export const STORE_LOCATOR_PAGE_CMS_QUERY = `#graphql
  ${STORE_LOCATOR_HERO_FRAGMENT}
  ${STORE_TYPE_FRAGMENT}

  query StoreLocatorPageCms {
    storeLocatorPage: metaobject(
      handle: {type: "store_locator", handle: "store-locator"}
    ) {
      id
      handle
      ...StoreLocatorHero

      category: field(key: "category") {
        references(first: 50) {
          nodes {
            ... on Metaobject {
              ...StoreType
            }
          }
        }
      }
    }
  }
` as const;
