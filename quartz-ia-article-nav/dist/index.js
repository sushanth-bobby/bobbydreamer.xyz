// components.tsx
import { resolveRelative } from "@quartz-community/utils";

// ../quartz.explorer-order.ts
function getArticleSequence(entry) {
  const slug = typeof entry === "string" ? entry : entry?.slugSegment ?? entry?.slug ?? "";
  const match = /^(\d+)(?:[-.])/.exec(slug);
  return match ? Number(match[1]) : void 0;
}
function compareArticleSequence(a, b) {
  const aSlug = a.slugSegment ?? a.slug ?? "";
  const bSlug = b.slugSegment ?? b.slug ?? "";
  const aMatch = /^(\d+)(?:[-.])/.exec(aSlug);
  const bMatch = /^(\d+)(?:[-.])/.exec(bSlug);
  const aSequence = aMatch ? Number(aMatch[1]) : void 0;
  const bSequence = bMatch ? Number(bMatch[1]) : void 0;
  if (aSequence !== void 0 && bSequence !== void 0) {
    return bSequence - aSequence || aSlug.localeCompare(bSlug, void 0, {
      numeric: true,
      sensitivity: "base"
    });
  }
  if (aSequence === void 0 && bSequence !== void 0) return -1;
  if (aSequence !== void 0 && bSequence === void 0) return 1;
  return aSlug.localeCompare(bSlug, void 0, { numeric: true, sensitivity: "base" });
}
function isNumberedArticle(entry) {
  return getArticleSequence(entry) !== void 0;
}

// ../quartz.ia.ts
function numberedArticles(files) {
  return files.filter((file) => isNumberedArticle(file)).sort(compareArticleSequence);
}
function articleNeighbors(files, slug) {
  if (!slug || getArticleSequence(slug) === void 0) return void 0;
  const ordered = numberedArticles(files);
  const index = ordered.findIndex((file) => file.slug === slug);
  if (index < 0) return void 0;
  return {
    previous: ordered[index + 1],
    next: ordered[index - 1]
  };
}

// style.ts
var style = `
.article-sequence-navigation {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.article-sequence-navigation a {
  display: flex;
  flex-direction: column;
  min-height: 3.4rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--bdv-border, var(--lightgray));
  border-radius: var(--bdv-radius-md, 0.75rem);
  background: var(--bdv-surface-raised, var(--light));
  color: var(--dark);
  text-decoration: none;
  box-shadow: var(--bdv-shadow-sm, none);
  transition: transform 160ms ease, border-color 160ms ease;
}
.article-sequence-navigation a:hover {
  transform: translateY(-2px);
  border-color: var(--secondary);
}
.article-sequence-navigation a > span {
  color: var(--gray);
  font-size: 0.76rem;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
.article-sequence-navigation a > strong { margin-top: 0.25rem; color: var(--dark); line-height: 1.35; }
.article-sequence-next { grid-column: 2; text-align: right; }
@media (max-width: 800px) {
  .article-sequence-navigation { grid-template-columns: 1fr; }
  .article-sequence-next { grid-column: 1; text-align: left; }
}
`;
var style_default = style;

// components.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
var ArticleSequenceNavigation = () => {
  const ArticleNavigation = ({ allFiles, fileData }) => {
    const neighbors = articleNeighbors(allFiles, fileData.slug);
    if (!neighbors) return null;
    const item = (direction) => {
      const page = neighbors[direction];
      if (!page?.slug) return null;
      const title = page.frontmatter?.title ?? page.slug;
      return /* @__PURE__ */ jsxs(
        "a",
        {
          class: `article-sequence-${direction} internal`,
          href: resolveRelative(fileData.slug, page.slug),
          children: [
            /* @__PURE__ */ jsx("span", { children: direction === "previous" ? "\u2190 Previous" : "Next \u2192" }),
            /* @__PURE__ */ jsx("strong", { children: title })
          ]
        }
      );
    };
    return /* @__PURE__ */ jsxs("nav", { class: "article-sequence-navigation", "aria-label": "Article sequence", children: [
      item("previous"),
      item("next")
    ] });
  };
  ArticleNavigation.css = style_default;
  return ArticleNavigation;
};
export {
  ArticleSequenceNavigation as default
};
