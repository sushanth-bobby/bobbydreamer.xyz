import type { QuartzComponent, QuartzComponentConstructor } from "../quartz/components/types"
import { resolveRelative } from "@quartz-community/utils"
import { articleNeighbors } from "../quartz.ia"
import style from "./style"

export const ArticleSequenceNavigation: QuartzComponentConstructor = () => {
  const ArticleNavigation: QuartzComponent = ({ allFiles, fileData }) => {
    const neighbors = articleNeighbors(allFiles, fileData.slug)
    if (!neighbors) return null

    const item = (direction: "previous" | "next") => {
      const page = neighbors[direction]
      if (!page?.slug) return null
      const title = page.frontmatter?.title ?? page.slug
      return (
        <a
          class={`article-sequence-${direction} internal`}
          href={resolveRelative(fileData.slug!, page.slug)}
        >
          <span>{direction === "previous" ? "← Previous" : "Next →"}</span>
          <strong>{title}</strong>
        </a>
      )
    }

    return (
      <nav class="article-sequence-navigation" aria-label="Article sequence">
        {item("previous")}
        {item("next")}
      </nav>
    )
  }

  ArticleNavigation.css = style
  return ArticleNavigation
}

export default ArticleSequenceNavigation
