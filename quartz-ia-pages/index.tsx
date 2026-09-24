import type { QuartzComponent, QuartzComponentConstructor } from "../quartz/components/types"
import type { QuartzPageTypePlugin } from "../quartz/plugins/types"
import type { QuartzPluginData } from "../quartz/plugins/vfile"
import { write } from "../quartz/plugins/emitters/helpers"
import { formatDate, resolveRelative } from "@quartz-community/utils"
import {
  archiveYears,
  articlesForYear,
  frontmatterDate,
  numberedArticles,
  quartz4CompatibilityRoutes,
} from "../quartz.ia"
import style from "./style"

type ArchiveData = QuartzPluginData & {
  archiveKind?: "blog" | "year" | "topics"
  archiveYear?: number
}

const curatedTopics = [
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
  { slug: "pandas", label: "pandas" },
]

function ArchiveBody(): QuartzComponent {
  const Archive: QuartzComponent = ({ allFiles, fileData, cfg }) => {
    const data = fileData as ArchiveData
    const years = archiveYears(allFiles)
    const currentSlug = fileData.slug!

    if (data.archiveKind === "topics") {
      const availableTags = new Set(allFiles.flatMap((file) => file.frontmatter?.tags ?? []))
      return (
        <div class="topics-landing">
          <p>Browse established topic collections from the existing article tags.</p>
          <ul>
            {curatedTopics
              .filter(({ slug }) => availableTags.has(slug))
              .map(({ slug, label }) => (
                <li>
                  <a class="internal tag-link" href={resolveRelative(currentSlug, `tags/${slug}`)}>
                    {label}
                  </a>
                </li>
              ))}
          </ul>
          <p>
            <a class="internal" href={resolveRelative(currentSlug, "tags/index")}>
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
            href={resolveRelative(currentSlug, "blog/index")}
            aria-current={data.archiveKind === "blog" ? "page" : undefined}
          >
            All
          </a>
          {years.map((year) => (
            <a
              class="internal"
              href={resolveRelative(currentSlug, `blog/${year}/index`)}
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
    match: ({ slug }) => /^(?:blog|topics)(?:\/|$)/.test(slug),
    generate({ content }) {
      const files = content.map((entry) => entry[1].data)
      return [
        { slug: "blog/index", title: "Blog", data: { archiveKind: "blog" } },
        ...archiveYears(files).map((year) => ({
          slug: `blog/${year}/index`,
          title: "Blog",
          data: { archiveKind: "year", archiveYear: year },
        })),
        { slug: "topics/index", title: "Topics", data: { archiveKind: "topics" } },
      ]
    },
    layout: "archive",
    body: ArchiveBody as QuartzComponentConstructor,
    async *emit(ctx) {
      for (const [slug, target] of Object.entries(quartz4CompatibilityRoutes)) {
        const html = `<!DOCTYPE html>\n<html lang="en-us">\n<head>\n<title>${target}</title>\n<link rel="canonical" href="/${target}">\n<meta name="robots" content="noindex">\n<meta charset="utf-8">\n<meta http-equiv="refresh" content="0; url=/${target}">\n</head>\n</html>\n`
        yield write({ ctx, slug: slug as never, ext: ".html", content: html })
      }
    },
  }) as never

export default InformationArchitecturePages
