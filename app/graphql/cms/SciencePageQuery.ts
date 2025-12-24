import {SCIENCE_HERO_FRAGMENT} from './ModuleFragments';

export const SCIENCE_PAGE_CMS_QUERY = `#graphql
  ${SCIENCE_HERO_FRAGMENT}
  
  query SciencePageCms {
    sciencePage: metaobject(handle: {handle: "science-page", type: "science_page"}) {
      id
      handle
      
      # Use fragment for science hero
      ... on Metaobject {
        ...ScienceHero
      }
    }
  }
` as const;
