export const GLOBAL_BANNER_CMS_QUERY = `#graphql
  query GlobalBannerCms {
    globalBanner: metaobject(handle: {handle: "global-banner", type: "global_banner"}) {
      id
      handle
      display: field(key: "display") {
        value
      }
      content: field(key: "content") {
        value
      }
    }
  }
` as const;
