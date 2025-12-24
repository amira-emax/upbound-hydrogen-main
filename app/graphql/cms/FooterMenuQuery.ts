import {FOOTER_MENU_GROUP_FRAGMENT} from './ModuleFragments';

export const FOOTER_MENU_CMS_QUERY = `#graphql
  ${FOOTER_MENU_GROUP_FRAGMENT}

  query FooterMenuCms {
    footerMenu: metaobject(handle: {handle: "footer-menu", type: "footer_menu"}) {
      id
      handle
      groups: field(key: "groups") {
        references(first: 10) {
          nodes {
            ... on Metaobject {
                ...FooterMenuGroup
            }
          }
        }
      }
    }
  }
` as const;
