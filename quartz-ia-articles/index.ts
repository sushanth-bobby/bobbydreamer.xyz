import { ContentBody } from "@quartz-community/content-page"
import type { QuartzPageTypePlugin } from "../quartz/plugins/types"
import { isBlogArticle } from "../quartz.ia"

const BlogArticlePages: QuartzPageTypePlugin = () => ({
  name: "BlogArticlePages",
  priority: 100,
  match: ({ slug, fileData }) => isBlogArticle(fileData) || slug === "til/index",
  layout: "article",
  body: ContentBody,
})

export default BlogArticlePages
