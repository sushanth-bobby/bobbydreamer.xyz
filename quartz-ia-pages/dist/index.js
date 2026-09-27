// ../quartz/plugins/emitters/helpers.ts
import path from "path";
import fs from "fs";

// ../quartz/util/path.ts
import {
  isFilePath,
  isFullSlug,
  isSimpleSlug,
  isRelativeURL,
  isAbsoluteURL,
  getFullSlug,
  slugifyFilePath,
  simplifySlug,
  joinSegments,
  endsWith,
  trimSuffix,
  stripSlashes,
  getFileExtension,
  isFolderPath,
  getAllSegmentPrefixes,
  pathToRoot,
  resolveRelative,
  splitAnchor,
  slugTag,
  transformInternalLink,
  transformLink,
  normalizeHastElement
} from "@quartz-community/utils";

// ../quartz/plugins/emitters/helpers.ts
var write = async ({ ctx, slug, ext, content }) => {
  const pathToPage = joinSegments(ctx.argv.output, slug + ext);
  const dir = path.dirname(pathToPage);
  await fs.promises.mkdir(dir, { recursive: true });
  await fs.promises.writeFile(pathToPage, content);
  return pathToPage;
};

// index.tsx
import { formatDate, resolveRelative as resolveRelative2 } from "@quartz-community/utils";

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
function frontmatterDate(file) {
  const raw = file.frontmatter?.date;
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw;
  if (typeof raw === "string" || typeof raw === "number") {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return void 0;
}
function archiveYears(files) {
  return [
    ...new Set(
      numberedArticles(files).map(frontmatterDate).filter((date) => !!date).map((date) => date.getUTCFullYear())
    )
  ].sort((a, b) => b - a);
}
function articlesForYear(files, year) {
  return numberedArticles(files).filter((file) => frontmatterDate(file)?.getUTCFullYear() === year).sort((a, b) => {
    const dateDifference = (frontmatterDate(b)?.getTime() ?? 0) - (frontmatterDate(a)?.getTime() ?? 0);
    return dateDifference || compareArticleSequence(a, b);
  });
}
var quartz4CompatibilityRoutes = {
  "pages/about_me": "bio/",
  "pages/irevere": "irevere/",
  "pages/til": "til/"
};

// ../quartz.production.ts
function canonicalPathForSlug(slug) {
  const normalized = slug.replace(/^\/+|\/+$/g, "").toLowerCase();
  if (normalized === "" || normalized === "index") return "/";
  if (normalized.endsWith("/index")) return `/${normalized.slice(0, -"/index".length)}/`;
  return `/${normalized}`;
}
function absoluteSiteUrl(baseUrl, slug) {
  const site = new URL(`https://${baseUrl}`);
  const configuredBase = site.pathname.replace(/\/$/, "");
  site.pathname = `${configuredBase}${canonicalPathForSlug(slug)}`;
  site.search = "";
  site.hash = "";
  return site.toString();
}
function productionDescription(slug) {
  if (slug === "blog/index") {
    return "All bobby_dreamer Blog Articles in numeric publication sequence.";
  }
  const year = /^blog\/(\d{4})\/index$/.exec(slug)?.[1];
  if (year) return `bobby_dreamer Blog Articles published in ${year}.`;
  if (slug === "topics/index") {
    return "Browse curated topics from bobby_dreamer Blog Articles.";
  }
  if (slug === "tags/index") return "Browse all article tags on bobbydreamer.xyz.";
  const tag = /^tags\/(.+)$/.exec(slug)?.[1];
  if (tag) return `Browse bobby_dreamer Blog Articles tagged ${tag}.`;
  return void 0;
}
function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}
function escapeCdata(value) {
  return value.replaceAll("]]>", "]]]]><![CDATA[>");
}

// style.ts
var style = `
.blog-year-navigation {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.blog-archive-list { list-style: none; padding: 0; }
.blog-archive-list > li { margin: 0 0 1.5rem; }
.blog-archive-list h3, .blog-archive-list p { margin: 0.25rem 0; }
.blog-archive-list time { color: var(--gray); }
.topics-landing ul { columns: 2; }
@media (max-width: 800px) {
  .topics-landing ul { columns: 1; }
}
`;
var style_default = style;

// index.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
var rssArticleLimit = 20;
var curatedTopics = [
  { slug: "quest-for-wealth", label: "quest-for-wealth" },
  { slug: "notes", label: "notes" },
  { slug: "web-development", label: "web-development" },
  { slug: "gcp", label: "GCP" },
  { slug: "python", label: "python" },
  { slug: "nodejs", label: "nodejs" },
  { slug: "personal-development", label: "personal-development" },
  { slug: "gatsbyjs", label: "gatsbyjs" },
  { slug: "firebase", label: "firebase" },
  { slug: "javascript", label: "javascript" },
  { slug: "pandas", label: "pandas" }
];
function rssFeed(baseUrl, content) {
  const articles = numberedArticles(content.map((entry) => entry[1].data)).slice(0, rssArticleLimit);
  const channelUrl = absoluteSiteUrl(baseUrl, "index");
  const feedUrl = new URL("index.xml", channelUrl).toString();
  const lastBuildDate = frontmatterDate(articles[0])?.toUTCString();
  const items = articles.map((article) => {
    const url = absoluteSiteUrl(baseUrl, article.slug);
    const title = escapeXml(article.frontmatter?.title ?? article.slug);
    const description = escapeCdata(article.description ?? "");
    const date = frontmatterDate(article)?.toUTCString();
    return `<item>
    <title>${title}</title>
    <link>${escapeXml(url)}</link>
    <guid isPermaLink="true">${escapeXml(url)}</guid>
    <description><![CDATA[${description}]]></description>
    ${date ? `<pubDate>${date}</pubDate>` : ""}
  </item>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>bobby_dreamer</title>
    <link>${escapeXml(channelUrl)}</link>
    <description>Latest bobby_dreamer Blog Articles in numeric publication sequence.</description>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    ${lastBuildDate ? `<lastBuildDate>${lastBuildDate}</lastBuildDate>` : ""}
    ${items}
  </channel>
</rss>
`;
}
function robotsPolicy(baseUrl) {
  return `User-agent: *
Allow: /
Sitemap: ${absoluteSiteUrl(baseUrl, "sitemap.xml")}
`;
}
function ArchiveBody() {
  const Archive = ({ allFiles, fileData, cfg }) => {
    const data = fileData;
    const years = archiveYears(allFiles);
    const currentSlug = fileData.slug;
    if (data.archiveKind === "topics") {
      const availableTags = new Set(allFiles.flatMap((file) => file.frontmatter?.tags ?? []));
      return /* @__PURE__ */ jsxs("div", { class: "topics-landing", children: [
        /* @__PURE__ */ jsx("p", { children: "Browse established topic collections from the existing article tags." }),
        /* @__PURE__ */ jsx("ul", { children: curatedTopics.filter(({ slug }) => availableTags.has(slug)).map(({ slug, label }) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { class: "internal tag-link", href: resolveRelative2(currentSlug, `tags/${slug}`), children: label }) })) }),
        /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("a", { class: "internal", href: resolveRelative2(currentSlug, "tags/index"), children: "See all tags \u2192" }) })
      ] });
    }
    const articles = data.archiveKind === "year" && data.archiveYear ? articlesForYear(allFiles, data.archiveYear) : numberedArticles(allFiles);
    return /* @__PURE__ */ jsxs("div", { class: "blog-archive", children: [
      /* @__PURE__ */ jsxs("nav", { class: "blog-year-navigation", "aria-label": "Blog archives", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            class: "internal",
            href: resolveRelative2(currentSlug, "blog/index"),
            "aria-current": data.archiveKind === "blog" ? "page" : void 0,
            children: "All"
          }
        ),
        years.map((year) => /* @__PURE__ */ jsx(
          "a",
          {
            class: "internal",
            href: resolveRelative2(currentSlug, `blog/${year}/index`),
            "aria-current": data.archiveYear === year ? "page" : void 0,
            children: year
          }
        ))
      ] }),
      /* @__PURE__ */ jsx("ul", { class: "blog-archive-list", children: articles.map((article) => {
        const date = frontmatterDate(article);
        return /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("h3", { children: /* @__PURE__ */ jsx("a", { class: "internal", href: resolveRelative2(currentSlug, article.slug), children: article.frontmatter?.title ?? article.slug }) }),
          date && /* @__PURE__ */ jsx("time", { datetime: date.toISOString(), children: formatDate(date, cfg.locale) }),
          article.description && /* @__PURE__ */ jsx("p", { children: article.description })
        ] });
      }) })
    ] });
  };
  Archive.css = style_default;
  return Archive;
}
var InformationArchitecturePages = () => ({
  name: "InformationArchitecturePages",
  priority: 100,
  match: ({ slug }) => /^(?:blog|topics)(?:\/|$)/.test(slug),
  generate({ content }) {
    const files = content.map((entry) => entry[1].data);
    return [
      {
        slug: "blog/index",
        title: "Blog",
        data: { archiveKind: "blog", description: productionDescription("blog/index") }
      },
      ...archiveYears(files).map((year) => ({
        slug: `blog/${year}/index`,
        title: "Blog",
        data: {
          archiveKind: "year",
          archiveYear: year,
          description: productionDescription(`blog/${year}/index`)
        }
      })),
      {
        slug: "topics/index",
        title: "Topics",
        data: { archiveKind: "topics", description: productionDescription("topics/index") }
      }
    ];
  },
  layout: "archive",
  body: ArchiveBody,
  async *emit(ctx, content) {
    for (const [slug, target] of Object.entries(quartz4CompatibilityRoutes)) {
      const html = `<!DOCTYPE html>
<html lang="en-us">
<head>
<title>${target}</title>
<link rel="canonical" href="/${target}">
<meta name="robots" content="noindex">
<meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=/${target}">
</head>
</html>
`;
      yield write({ ctx, slug, ext: ".html", content: html });
    }
    const baseUrl = ctx.cfg.configuration.baseUrl;
    if (!baseUrl)
      throw new Error("Production RSS and robots emission requires configuration.baseUrl");
    yield write({ ctx, slug: "index", ext: ".xml", content: rssFeed(baseUrl, content) });
    yield write({ ctx, slug: "robots", ext: ".txt", content: robotsPolicy(baseUrl) });
  }
});
var index_default = InformationArchitecturePages;
export {
  index_default as default
};
