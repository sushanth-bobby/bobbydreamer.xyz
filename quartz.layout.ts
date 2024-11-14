import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"
import { SimpleSlug } from "./quartz/util/path"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  // header: [],
  header: [Component.LinksHeader()],
  afterBody: [],
  footer: Component.Footer({
    links: {
      "github": "https://github.com/sushanth-bobby",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),    

    Component.DesktopOnly(Component.RecentNotes({
      title: "Recently Created",
      limit: 7,
      showTags: false,
      linkToMore: "blog/" as SimpleSlug,
    })),    
    
  ],
  right: [
    Component.Darkmode(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Graph(),    
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Search(),

    Component.DesktopOnly(Component.Explorer({
      filterFn: (node) => {
        // set containing names of everything you want to filter out
        const omit = new Set(["about_me", "irevere", "til"])
        // console.log(node.name.toLowerCase())
        return !omit.has(node.name.toLowerCase())
      },
    })),

  ],
  right: [
    Component.Darkmode(),
    Component.Backlinks(),
  ],
}

