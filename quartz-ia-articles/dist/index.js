// index.ts
import { ContentBody } from "@quartz-community/content-page";

// ../quartz.ia.ts
var nonArticleRoutes = /^(?:(?:index|til(?:\/index)?|bio(?:\/index)?|irevere(?:\/index)?|music(?:\/index)?)$|(?:blog|topics|tags)(?:\/|$))/;
function isBlogArticle(file) {
  const slug = file.slug ?? "";
  return !nonArticleRoutes.test(slug) && frontmatterDate(file) !== void 0;
}
function frontmatterDate(file) {
  const raw = file.frontmatter?.date;
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw;
  if (typeof raw === "string" || typeof raw === "number") {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return void 0;
}

// index.ts
var BlogArticlePages = () => ({
  name: "BlogArticlePages",
  priority: 100,
  match: ({ slug, fileData }) => isBlogArticle(fileData) || slug === "til/index",
  layout: "article",
  body: ContentBody
});
var index_default = BlogArticlePages;
export {
  index_default as default
};
