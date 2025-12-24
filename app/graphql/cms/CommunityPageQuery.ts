import {COMMUNITY_HERO_FRAGMENT} from './ModuleFragments';

export const COMMUNITY_PAGE_CMS_QUERY = `#graphql
  ${COMMUNITY_HERO_FRAGMENT}
  
  query CommunityPageCms {
    communityPage: metaobject(handle: {handle: "community-page", type: "community_page"}) {
      id
      handle
      
      # Use fragment for community hero
      ... on Metaobject {
        ...CommunityHero
      }
    }
  }
` as const;
