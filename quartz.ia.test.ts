import assert from "node:assert/strict"
import fs from "node:fs"
import { test } from "node:test"
import { TagList } from "@quartz-community/tag-list"
import type { VNode } from "preact"
import renderToString from "preact-render-to-string"
import type { QuartzComponentProps } from "./quartz/components/types"
import BlogArticlePages from "./quartz-ia-articles"
import { ArticleTags } from "./quartz-ia-properties/components"
import type { QuartzPluginData } from "./quartz/plugins/vfile"
import {
  archiveYears,
  articleNeighbors,
  articlesForYear,
  classifyPage,
  isBlogArticle,
  numberedArticles,
  quartz4CompatibilityRoutes,
} from "./quartz.ia"

const page = (slug: string, date: string, title = slug): QuartzPluginData => ({
  slug: slug as never,
  frontmatter: { title, date } as never,
})

test("latest articles are numbered-only, numeric, limited, and date-independent", () => {
  const files = [
    page("149-newer-date/index", "2030-01-01"),
    page("151-older-date/index", "2018-01-01"),
    page("24-things/index", "2020-01-02"),
    page("24-connecting/index", "2020-01-01"),
    page("til/index", "2031-01-01"),
  ]

  assert.deepEqual(
    numberedArticles(files)
      .slice(0, 3)
      .map((file) => file.slug),
    ["151-older-date/index", "149-newer-date/index", "24-connecting/index"],
  )
})

test("year archives use frontmatter dates, date order, and derive future years", () => {
  const files = [
    page("151-old-sequence/index", "2020-01-01"),
    page("02-newer-in-year/index", "2020-12-31"),
    page("149-future/index", "2031-05-04"),
  ]

  assert.deepEqual(archiveYears(files), [2031, 2020])
  assert.deepEqual(
    articlesForYear(files, 2020).map((file) => file.slug),
    ["02-newer-in-year/index", "151-old-sequence/index"],
  )
})

test("article neighbors follow numeric sequence through gaps, duplicates, and boundaries", () => {
  const files = [
    page("24-things/index", "2020-01-01"),
    page("24-connecting/index", "2020-01-01"),
    page("21-lower/index", "2020-01-01"),
    page("151-highest/index", "2020-01-01"),
    page("til/index", "2020-01-01"),
  ]

  assert.equal(articleNeighbors(files, "til/index"), undefined)
  assert.equal(articleNeighbors(files, "151-highest/index")?.next, undefined)
  assert.equal(articleNeighbors(files, "21-lower/index")?.previous, undefined)
  assert.equal(articleNeighbors(files, "24-connecting/index")?.previous?.slug, "24-things/index")
  assert.equal(articleNeighbors(files, "24-connecting/index")?.next?.slug, "151-highest/index")
  assert.equal(articleNeighbors(files, "24-things/index")?.previous?.slug, "21-lower/index")
})

test("page classes drive structural component selection", () => {
  assert.equal(classifyPage({ slug: "index" as never }), "home")
  assert.equal(classifyPage(page("151-post/index", "2023-08-23")), "article")
  assert.equal(classifyPage(page("future-quartz-post/index", "2026-09-24")), "article")
  assert.equal(classifyPage({ slug: "undated-note/index" as never }), "other")
  assert.equal(classifyPage({ slug: "til/index" as never }), "til")
  assert.equal(classifyPage({ slug: "bio/index" as never }), "static")
  assert.equal(classifyPage({ slug: "blog/2023/index" as never }), "archive")
  assert.equal(classifyPage({ slug: "topics/index" as never }), "archive")
  assert.equal(classifyPage({ slug: "tags/python" as never }), "topic")
})

test("blog article presentation is independent from numeric chronology", () => {
  const migrated = page("151-legacy/index", "2023-08-23")
  const newlyAuthored = page("future-quartz-post/index", "2026-09-24")
  const staticPage = {
    slug: "bio/index" as never,
    frontmatter: { title: "About", date: "2026-09-24" } as never,
  }

  assert.equal(isBlogArticle(migrated), true)
  assert.equal(isBlogArticle(newlyAuthored), true)
  assert.equal(isBlogArticle(staticPage), false)
  assert.deepEqual(
    numberedArticles([migrated, newlyAuthored]).map((file) => file.slug),
    ["151-legacy/index"],
  )
})

test("legacy and future posts select one Blog Article page type", () => {
  const matcher = BlogArticlePages().match
  const matches = (fileData: QuartzPluginData) =>
    matcher({ slug: fileData.slug!, fileData, cfg: {} as never })

  assert.equal(matches(page("151-legacy/index", "2023-08-23")), true)
  assert.equal(matches(page("future-quartz-post/index", "2026-09-24")), true)
  assert.equal(matches({ slug: "bio/index" as never, frontmatter: { title: "About" } }), false)
})

test("Quartz 4 compatibility routes map directly to canonical pages", () => {
  assert.deepEqual(quartz4CompatibilityRoutes, {
    "pages/about_me": "bio/",
    "pages/irevere": "irevere/",
    "pages/til": "til/",
  })
})

test("Phase 4B removes Explorer UI registration without removing shared sequence logic", () => {
  const configuration = fs.readFileSync("quartz.config.yaml", "utf8")
  const bootstrap = fs.readFileSync("quartz.ts", "utf8")
  assert.doesNotMatch(configuration, /@quartz-community\/explorer/)
  assert.doesNotMatch(bootstrap, /@quartz-community\/explorer/)
  assert.match(bootstrap, /compareArticleSequence/)
  assert.match(bootstrap, /isNumberedArticle/)
})

test("repository launch commands use the in-tree Quartz runtime", () => {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8")) as {
    scripts: Record<string, string>
  }
  const dockerfile = fs.readFileSync("Dockerfile", "utf8")

  for (const script of ["quartz", "build", "serve", "docs"] as const) {
    assert.match(packageJson.scripts[script], /node \.\/quartz\/bootstrap-cli\.mjs/)
    assert.doesNotMatch(packageJson.scripts[script], /npx quartz/)
  }
  assert.doesNotMatch(dockerfile, /npx quartz/)
  assert.match(dockerfile, /node \.\/quartz\/bootstrap-cli\.mjs plugin install/)
  assert.match(dockerfile, /"node", "\.\/quartz\/bootstrap-cli\.mjs", "build", "--serve"/)
})

test("Blog and year archives share the same visible title and archive component", () => {
  const source = fs.readFileSync("quartz-ia-pages/index.tsx", "utf8")
  assert.match(source, /slug: "blog\/index", title: "Blog"/)
  assert.match(source, /slug: `blog\/\$\{year\}\/index`,\s*title: "Blog"/)
  assert.equal((source.match(/<div class="blog-archive">/g) ?? []).length, 1)
})

test("the site identity references the repository-owned brand asset", () => {
  const source = fs.readFileSync("quartz-ia-header/components.tsx", "utf8")
  assert.match(source, /static\/brand\/bobbydreamer-mark\.png/)
  assert.match(source, /aria-hidden="true"/)
  assert.match(source, /<span>bobby_dreamer<\/span>/)
})

test("Phase 4C keeps the homepage greeting as the semantic H1", () => {
  const homepage = fs.readFileSync("content/index.md", "utf8")
  assert.match(homepage, /^# Hello, i am Sushanth\.$/m)
})

test("Phase 4D defines exact typography scales from one token source", () => {
  const styles = fs.readFileSync("quartz/styles/custom.scss", "utf8")
  const headerStyles = fs.readFileSync("quartz-ia-header/style.ts", "utf8")

  assert.match(styles, /--bdv-page-title-size: 2\.5rem;/)
  assert.match(styles, /--bdv-navigation-size: 1\.2rem;/)
  assert.match(styles, /--bdv-home-greeting-size: 1\.7rem;/)
  assert.match(styles, /--bdv-site-identity-size: 3rem;/)
  assert.match(styles, /\.article-title \{[\s\S]*font-size: var\(--bdv-page-title-size\)/)
  const articleTitleRule = styles.match(/html body \.article-title \{([\s\S]*?)\}/)?.[1]
  assert.ok(articleTitleRule)
  assert.doesNotMatch(articleTitleRule, /max-(?:inline-)?size|max-width|white-space:\s*nowrap/)
  assert.match(styles, /#hello-i-am-sushanth \{[\s\S]*font-size: var\(--bdv-home-greeting-size\)/)
  assert.match(headerStyles, /\.site-identity \{[\s\S]*font-size: var\(--bdv-site-identity-size\)/)
  assert.match(
    headerStyles,
    /\.site-navigation-links a \{[\s\S]*font-size: var\(--bdv-navigation-size\)/,
  )
  assert.match(
    styles,
    /@media all and \(\$mobile\)[\s\S]*--bdv-page-title-size: 2rem;[\s\S]*--bdv-site-identity-size: 2rem;/,
  )
})

test("Phase 4C moves a site-wide graph from T.I.L to the homepage", () => {
  const configuration = fs.readFileSync("quartz.config.yaml", "utf8")
  assert.match(
    configuration,
    /@quartz-community\/graph[\s\S]*depth: -1[\s\S]*position: afterBody[\s\S]*condition: home-page/,
  )
  assert.doesNotMatch(configuration, /condition: til-page/)
})

test("Phase 4E.1 gives every Blog Article tags then content metadata without Properties", () => {
  const configuration = fs.readFileSync("quartz.config.yaml", "utf8")
  assert.match(configuration, /@quartz-community\/tag-list[\s\S]*enabled: false/)
  assert.match(
    configuration,
    /@quartz-community\/content-meta[\s\S]*priority: 20[\s\S]*condition: blog-article/,
  )
  assert.match(configuration, /@quartz-community\/note-properties[\s\S]*condition: never-render/)
  assert.match(
    configuration,
    /@bdv\/quartz-ia-properties[\s\S]*priority: 15[\s\S]*condition: blog-article/,
  )
  assert.match(configuration, /@quartz-community\/table-of-contents[\s\S]*condition: blog-article/)
  assert.match(configuration, /@bdv\/quartz-ia-article-nav[\s\S]*condition: numbered-article/)
  assert.equal(ArticleTags(undefined).css, TagList().css)
})

test("Blog listings retain descriptions while article composition does not render them", () => {
  const archiveSource = fs.readFileSync("quartz-ia-pages/index.tsx", "utf8")
  const articleSource = fs.readFileSync("quartz-ia-properties/components.tsx", "utf8")

  assert.match(archiveSource, /article\.description && <p>\{article\.description\}<\/p>/)
  assert.doesNotMatch(articleSource, /description|NoteProperties|metadata-container/)
})

test("Phase 4E tag list omits empty markup and preserves linked pills", () => {
  const Component = TagList()
  const render = (tags: string[]) =>
    renderToString(
      Component({
        fileData: {
          slug: "147-nodejs-external-functions/index",
          frontmatter: { tags },
        },
      } as unknown as QuartzComponentProps) as VNode,
    )

  assert.equal(render([]), "")
  assert.match(render(["nodejs"]), /<ul class="tags">/)
  assert.match(render(["nodejs"]), /href="\.\.\/tags\/nodejs"/)
  assert.match(render(["nodejs", "notes"]), />nodejs<\/a>[\s\S]*>notes<\/a>/)
})
