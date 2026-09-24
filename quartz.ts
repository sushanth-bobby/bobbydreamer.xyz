import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"
import { registerCondition } from "./quartz/plugins/loader/conditions"
import { compareArticleSequence, isNumberedArticle } from "./quartz.explorer-order"
import { classifyPage } from "./quartz.ia"

componentRegistry.setOptionOverrides("@quartz-community/recent-notes", {
  title: "Latest Articles",
  limit: 7,
  linkToMore: "blog/index",
  showTags: false,
  hideTagPages: true,
  hideFolderPages: false,
  filter: (file: { slug?: string }) => isNumberedArticle(file),
  sort: compareArticleSequence,
})

registerCondition("home-page", ({ fileData }) => classifyPage(fileData) === "home")
registerCondition("not-home-page", ({ fileData }) => classifyPage(fileData) !== "home")
registerCondition("blog-article", ({ fileData }) => classifyPage(fileData) === "article")
registerCondition("numbered-article", ({ fileData }) => isNumberedArticle(fileData))
registerCondition("article-or-til", ({ fileData }) => {
  const pageClass = classifyPage(fileData)
  return pageClass === "article" || pageClass === "til"
})
registerCondition("never-render", () => false)
const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
