import type { QuartzComponent, QuartzComponentConstructor } from "../quartz/components/types"
import type { PageGenerator, PageMatcher, QuartzPageTypePlugin } from "../quartz/plugins/types"
import type { ProcessedContent, QuartzPluginData } from "../quartz/plugins/vfile"
import type { BuildCtx } from "../quartz/util/ctx"
import { write } from "../quartz/plugins/emitters/helpers"
import { formatDate, resolveRelative, slugTag, type FullSlug } from "@quartz-community/utils"
import {
  archiveYears,
  articlesForYear,
  frontmatterDate,
  numberedArticles,
  quartz4CompatibilityRoutes,
} from "../quartz.ia"
import {
  absoluteSiteUrl,
  escapeCdata,
  escapeXml,
  productionDescription,
} from "../quartz.production"
import style from "./style"

const rssArticleLimit = 20

type ArchiveData = QuartzPluginData & {
  archiveKind?: "blog" | "year" | "topics"
  archiveYear?: number
}

export const curatedTopicGroups = [
  {
    id: "build",
    label: "Build & technology",
    description: "Databases, programming, cloud platforms, web development, and project notes.",
    topics: [
      { slug: "web-development", label: "web-development" },
      { slug: "gcp", label: "GCP" },
      { slug: "python", label: "python" },
      { slug: "nodejs", label: "nodejs" },
      { slug: "gatsbyjs", label: "gatsbyjs" },
      { slug: "firebase", label: "firebase" },
      { slug: "javascript", label: "javascript" },
      { slug: "pandas", label: "pandas" },
    ],
  },
  {
    id: "invest",
    label: "Investment learning & journal",
    description:
      "Concepts, research, experiments, investors, and books—personal investigation rather than stock tips.",
    topics: [{ slug: "quest-for-wealth", label: "quest-for-wealth" }],
  },
  {
    id: "learn",
    label: "Learning & reflection",
    description: "Reading notes, personal development, observations, and lessons worth revisiting.",
    topics: [
      { slug: "notes", label: "notes" },
      { slug: "personal-development", label: "personal-development" },
    ],
  },
]

function rssFeed(baseUrl: string, content: ProcessedContent[]): string {
  const articles = numberedArticles(content.map((entry) => entry[1].data)).slice(0, rssArticleLimit)
  const channelUrl = absoluteSiteUrl(baseUrl, "index")
  const feedUrl = new URL("index.xml", channelUrl).toString()
  const lastBuildDate = frontmatterDate(articles[0])?.toUTCString()
  const items = articles
    .map((article) => {
      const url = absoluteSiteUrl(baseUrl, article.slug!)
      const title = escapeXml(article.frontmatter?.title ?? article.slug!)
      const description = escapeCdata(article.description ?? "")
      const date = frontmatterDate(article)?.toUTCString()
      return `<item>
    <title>${title}</title>
    <link>${escapeXml(url)}</link>
    <guid isPermaLink="true">${escapeXml(url)}</guid>
    <description><![CDATA[${description}]]></description>
    ${date ? `<pubDate>${date}</pubDate>` : ""}
  </item>`
    })
    .join("")

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
`
}

function robotsPolicy(baseUrl: string): string {
  return `User-agent: *\nAllow: /\nSitemap: ${absoluteSiteUrl(baseUrl, "sitemap.xml")}\n`
}

function ArchiveBody(): QuartzComponent {
  const Archive: QuartzComponent = ({ allFiles, fileData, cfg }) => {
    const data = fileData as ArchiveData
    const years = archiveYears(allFiles)
    const currentSlug = fileData.slug!

    if (data.archiveKind === "topics") {
      const availableTags = new Set(
        allFiles.flatMap((file) => (file.frontmatter?.tags ?? []).map((tag) => slugTag(tag))),
      )
      return (
        <div class="topics-landing">
          <p>Browse curated paths through the site's finer-grained article tags.</p>
          {curatedTopicGroups.map((group) => {
            const topics = group.topics.filter(({ slug }) => availableTags.has(slug))
            if (topics.length === 0) return null
            return (
              <section class="topic-group" aria-labelledby={`topic-group-${group.id}`}>
                <h2 id={`topic-group-${group.id}`}>{group.label}</h2>
                <p>{group.description}</p>
                <ul>
                  {topics.map(({ slug, label }) => (
                    <li>
                      <a
                        class="internal tag-link"
                        href={resolveRelative(currentSlug, `tags/${slug}` as FullSlug)}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
          <p>
            <a class="internal" href={resolveRelative(currentSlug, "tags/index" as FullSlug)}>
              See all tags →
            </a>
          </p>
        </div>
      )
    }

    const articles =
      data.archiveKind === "year" && data.archiveYear
        ? articlesForYear(allFiles, data.archiveYear)
        : numberedArticles(allFiles)

    return (
      <div class="blog-archive">
        <nav class="blog-year-navigation" aria-label="Blog archives">
          <a
            class="internal"
            href={resolveRelative(currentSlug, "blog/index" as FullSlug)}
            aria-current={data.archiveKind === "blog" ? "page" : undefined}
          >
            All
          </a>
          {years.map((year) => (
            <a
              class="internal"
              href={resolveRelative(currentSlug, `blog/${year}/index` as FullSlug)}
              aria-current={data.archiveYear === year ? "page" : undefined}
            >
              {year}
            </a>
          ))}
        </nav>
        <ul class="blog-archive-list">
          {articles.map((article) => {
            const date = frontmatterDate(article)
            return (
              <li>
                <h3>
                  <a class="internal" href={resolveRelative(currentSlug, article.slug!)}>
                    {article.frontmatter?.title ?? article.slug}
                  </a>
                </h3>
                {date && <time datetime={date.toISOString()}>{formatDate(date, cfg.locale)}</time>}
                {article.description && <p>{article.description}</p>}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  Archive.css = style
  return Archive
}

const InformationArchitecturePages: QuartzPageTypePlugin = () =>
  ({
    name: "InformationArchitecturePages",
    priority: 100,
    match: ({ slug }: Parameters<PageMatcher>[0]) => /^(?:blog|topics)(?:\/|$)/.test(slug),
    generate({ content }: Parameters<PageGenerator>[0]) {
      const files = content.map((entry) => entry[1].data)
      return [
        {
          slug: "blog/index",
          title: "Blog",
          data: { archiveKind: "blog", description: productionDescription("blog/index") },
        },
        ...archiveYears(files).map((year) => ({
          slug: `blog/${year}/index`,
          title: "Blog",
          data: {
            archiveKind: "year",
            archiveYear: year,
            description: productionDescription(`blog/${year}/index`),
          },
        })),
        {
          slug: "topics/index",
          title: "Topics",
          data: { archiveKind: "topics", description: productionDescription("topics/index") },
        },
      ]
    },
    layout: "archive",
    body: ArchiveBody as QuartzComponentConstructor,
    async *emit(ctx: BuildCtx, content: ProcessedContent[]) {
      for (const [slug, target] of Object.entries(quartz4CompatibilityRoutes)) {
        const html = `<!DOCTYPE html>\n<html lang="en-us">\n<head>\n<title>${target}</title>\n<link rel="canonical" href="/${target}">\n<meta name="robots" content="noindex">\n<meta charset="utf-8">\n<meta http-equiv="refresh" content="0; url=/${target}">\n</head>\n</html>\n`
        yield write({ ctx, slug: slug as never, ext: ".html", content: html })
      }

      const baseUrl = ctx.cfg.configuration.baseUrl
      if (!baseUrl)
        throw new Error("Production RSS and robots emission requires configuration.baseUrl")
      yield write({ ctx, slug: "index" as never, ext: ".xml", content: rssFeed(baseUrl, content) })
      yield write({ ctx, slug: "robots" as never, ext: ".txt", content: robotsPolicy(baseUrl) })
    },
  }) as never

export default InformationArchitecturePages
