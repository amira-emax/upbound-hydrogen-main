import {ACCOUNT_HERO_FRAGMENT} from './ModuleFragments';

// Merchandiser-managed hero shown above the Account section (sidebar +
// profile/orders/addresses/subscriptions/rewards). Configure in Shopify
// admin under Content > Metaobjects: type "account_page", handle
// "account-page", with "title" and "hero_image" fields set.
export const ACCOUNT_HERO_CMS_QUERY = `#graphql
  ${ACCOUNT_HERO_FRAGMENT}

  query AccountPageCms {
    accountHero: metaobject(handle: {handle: "account-page", type: "account_page"}) {
      id
      handle

      ... on Metaobject {
        ...AccountHero
      }
    }
  }
` as const;
