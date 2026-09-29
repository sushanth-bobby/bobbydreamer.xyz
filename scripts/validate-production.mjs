import fs from "node:fs/promises"
import path from "node:path"
import { parse as parseYaml } from "yaml"

const repositoryRoot = path.resolve(import.meta.dirname, "..")
const publicRoot = path.resolve(repositoryRoot, "public")
const contentRoot = path.resolve(repositoryRoot, "content")
const siteOrigin = "https://bobbydreamer.xyz"
const failures = []

const fail = (message) => failures.push(message)

async function exists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function listFiles(directory, predicate = () => true) {
  const result = []
  async function visit(current) {
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) await visit(fullPath)
      else if (predicate(fullPath)) result.push(fullPath)
    }
  }
  await visit(directory)
  return result.sort()
}

function frontmatter(markdown) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(markdown)
  return match ? (parseYaml(match[1]) ?? {}) : {}
}

function slugFromContentPath(filePath) {
  return path.relative(contentRoot, filePath).replaceAll(path.sep, "/").replace(/\.md$/, "")
}

function isBlogArticle(article) {
  const reserved =
    /^(?:(?:index|til(?:\/index)?|bio(?:\/index)?|irevere(?:\/index)?|music(?:\/index)?)$|(?:blog|topics|tags)(?:\/|$))/
  return !reserved.test(article.slug) && !Number.isNaN(new Date(article.data.date).getTime())
}

function sequence(slug) {
  const match = /^(\d+)(?:[-.])/.exec(slug)
  return match ? Number(match[1]) : undefined
}

function canonicalPath(slug) {
  slug = slug.toLowerCase()
  if (slug === "index") return "/"
  if (slug.endsWith("/index")) return `/${slug.slice(0, -"/index".length)}/`
  return `/${slug}`
}

function generatedPathForUrl(urlValue) {
  const url = new URL(urlValue)
  const pathname = decodeURIComponent(url.pathname)
  if (pathname === "/") return path.join(publicRoot, "index.html")
  if (pathname.endsWith("/")) return path.join(publicRoot, pathname.slice(1), "index.html")
  return path.join(publicRoot, `${pathname.slice(1)}.html`)
}

function attributes(html, selector) {
  return [...html.matchAll(selector)].map((match) => match[1])
}

function resolvedPath(href, pageUrl) {
  return new URL(href.replaceAll("&amp;", "&"), pageUrl).pathname
}

const markdownFiles = await listFiles(contentRoot, (file) => file.endsWith(".md"))
const articles = []
for (const filePath of markdownFiles) {
  const markdown = await fs.readFile(filePath, "utf8")
  const article = { slug: slugFromContentPath(filePath), data: frontmatter(markdown) }
  if (isBlogArticle(article)) articles.push(article)
}

const numbered = articles
  .filter((article) => sequence(article.slug) !== undefined)
  .sort(
    (left, right) =>
      sequence(right.slug) - sequence(left.slug) ||
      left.slug.localeCompare(right.slug, undefined, { numeric: true, sensitivity: "base" }),
  )

if (articles.length !== numbered.length) {
  fail(
    `${articles.length - numbered.length} Blog Articles are outside numeric production chronology`,
  )
}

let compositionMismatches = 0
let propertiesPanels = 0
let contextMismatches = 0
let renderedArticleContexts = 0
const renderedLearningArchiveContexts = { gatsby: 0, "google-domains": 0, gsutil: 0 }
for (const article of articles) {
  const htmlPath = path.join(publicRoot, ...article.slug.split("/")).replace(/index$/, "index.html")
  if (!(await exists(htmlPath))) {
    fail(`${article.slug}: generated article is missing`)
    continue
  }
  const html = await fs.readFile(htmlPath, "utf8")
  const titlePosition = html.indexOf('class="article-title"')
  const tagsPosition = html.indexOf('<ul class="tags">')
  const metaPosition = html.indexOf('class="content-meta"')
  const contextPosition = html.indexOf('class="article-context"')
  const contentPosition = html.indexOf("<article")
  const hasProperties = /class="[^"]*(?:metadata-container|note-properties)[^"]*"/.test(html)
  const expectsContext =
    ["historical", "superseded", "point-in-time"].includes(article.data.status) ||
    article.data.authorship === "ai"
  const hasContext = contextPosition >= 0
  const contexts = Array.isArray(article.data.learningArchiveContexts)
    ? article.data.learningArchiveContexts
    : []
  if (hasContext) renderedArticleContexts += 1
  if (expectsContext !== hasContext) contextMismatches += 1
  if (article.data.status === "historical") {
    if (
      !html.includes("Learning archive") ||
      !html.includes("This article reflects my experience with the technologies and versions") ||
      (html.match(/content-status-notice/g) ?? []).length !== 1
    ) {
      contextMismatches += 1
    }
  }
  for (const context of contexts) {
    const expectedText = {
      gatsby: "site now runs on Quartz",
      "google-domains": "Google Domains has since migrated to Squarespace",
      gsutil: "gcloud storage",
    }[context]
    if (!expectedText || !html.includes(expectedText)) contextMismatches += 1
    else renderedLearningArchiveContexts[context] += 1
  }
  if (contexts.length > 0 && !html.includes("Also note:")) contextMismatches += 1
  if (hasProperties) propertiesPanels += 1
  if (
    titlePosition < 0 ||
    metaPosition < 0 ||
    contentPosition < 0 ||
    titlePosition > metaPosition ||
    metaPosition > contentPosition ||
    (contextPosition >= 0 &&
      (contextPosition < metaPosition || contextPosition > contentPosition)) ||
    (tagsPosition >= 0 && (tagsPosition < titlePosition || tagsPosition > metaPosition)) ||
    hasProperties
  ) {
    compositionMismatches += 1
  }
}
if (propertiesPanels !== 0) fail(`${propertiesPanels} Blog Articles render Properties`)
if (compositionMismatches !== 0) fail(`${compositionMismatches} Blog Articles violate composition`)
if (contextMismatches !== 0) {
  fail(`${contextMismatches} Blog Articles mismatch their status/authorship context`)
}

const blogHtml = await fs.readFile(path.join(publicRoot, "blog", "index.html"), "utf8")
const blogList = /<ul class="blog-archive-list">([\s\S]*?)<\/ul>/.exec(blogHtml)?.[1] ?? ""
const blogPaths = attributes(blogList, /<a class="internal" href="([^"]+)"/g).map((href) =>
  resolvedPath(href, `${siteOrigin}/blog/`),
)
const expectedPaths = numbered.map((article) => canonicalPath(article.slug))
if (JSON.stringify(blogPaths) !== JSON.stringify(expectedPaths)) {
  const mismatch = blogPaths.findIndex((value, index) => value !== expectedPaths[index])
  fail(
    `Blog archive does not match complete numeric chronology at ${mismatch}: ${blogPaths[mismatch]} != ${expectedPaths[mismatch]}`,
  )
}

const homeHtml = await fs.readFile(path.join(publicRoot, "index.html"), "utf8")
const recentList = /<ul class="recent-ul">([\s\S]*?)<\/ul>/.exec(homeHtml)?.[1] ?? ""
const recentPaths = attributes(recentList, /<a[^>]+href="([^"]+)"/g)
  .map((href) => resolvedPath(href, `${siteOrigin}/`))
  .filter((value, index, all) => all.indexOf(value) === index)
  .slice(0, 7)
if (JSON.stringify(recentPaths) !== JSON.stringify(expectedPaths.slice(0, 7))) {
  fail("Latest Articles does not match the first seven numeric Blog Articles")
}

let neighborMismatches = 0
const neighborDetails = []
for (const [index, article] of numbered.entries()) {
  const htmlPath = path.join(publicRoot, ...article.slug.split("/")).replace(/index$/, "index.html")
  const html = await fs.readFile(htmlPath, "utf8")
  const nav = /<nav class="article-sequence-navigation"[\s\S]*?<\/nav>/.exec(html)?.[0] ?? ""
  const previous = /class="article-sequence-previous[^"]*" href="([^"]+)"/.exec(nav)?.[1]
  const next = /class="article-sequence-next[^"]*" href="([^"]+)"/.exec(nav)?.[1]
  const pageUrl = `${siteOrigin}${canonicalPath(article.slug)}`
  const actualPrevious = previous ? resolvedPath(previous, pageUrl) : undefined
  const actualNext = next ? resolvedPath(next, pageUrl) : undefined
  const expectedPrevious = numbered[index + 1] ? canonicalPath(numbered[index + 1].slug) : undefined
  const expectedNext = numbered[index - 1] ? canonicalPath(numbered[index - 1].slug) : undefined
  if (actualPrevious !== expectedPrevious || actualNext !== expectedNext) {
    neighborMismatches += 1
    neighborDetails.push(
      `${article.slug}: previous ${actualPrevious} != ${expectedPrevious}; next ${actualNext} != ${expectedNext}`,
    )
  }
}
if (neighborMismatches !== 0) {
  fail(
    `${neighborMismatches} Blog Articles have incorrect neighbors (${neighborDetails.join(" | ")})`,
  )
}

const sitemap = await fs.readFile(path.join(publicRoot, "sitemap.xml"), "utf8")
const sitemapUrls = attributes(sitemap, /<loc>([^<]+)<\/loc>/g)
if (sitemapUrls.some((url) => /localhost|\/index$/.test(url))) {
  fail("Sitemap contains localhost or internal /index URLs")
}

let metadataMismatches = 0
for (const pageUrl of sitemapUrls) {
  const htmlPath = generatedPathForUrl(pageUrl)
  if (!(await exists(htmlPath))) {
    metadataMismatches += 1
    continue
  }
  const html = await fs.readFile(htmlPath, "utf8")
  const canonical = attributes(html, /<link rel="canonical" href="([^"]+)"/g)
  const ogUrl = attributes(html, /<meta property="og:url" content="([^"]+)"/g)
  const twitterUrl = attributes(html, /<meta property="twitter:url" content="([^"]+)"/g)
  if (
    canonical.length !== 1 ||
    canonical[0] !== pageUrl ||
    ogUrl.length !== 1 ||
    ogUrl[0] !== pageUrl ||
    twitterUrl.length !== 1 ||
    twitterUrl[0] !== pageUrl ||
    html.includes("No description provided")
  ) {
    metadataMismatches += 1
  }
}
if (metadataMismatches !== 0)
  fail(`${metadataMismatches} sitemap pages have invalid production metadata`)

const notFound = await fs.readFile(path.join(publicRoot, "404.html"), "utf8")
if (!/<meta name="robots" content="noindex"/.test(notFound) || /rel="canonical"/.test(notFound)) {
  fail("404 must be noindex and must not declare a canonical page")
}

const rss = await fs.readFile(path.join(publicRoot, "index.xml"), "utf8")
const rssLinks = attributes(rss, /<item>[\s\S]*?<link>([^<]+)<\/link>/g)
const expectedRssLinks = numbered
  .slice(0, 20)
  .map((article) => `${siteOrigin}${canonicalPath(article.slug)}`)
if (JSON.stringify(rssLinks) !== JSON.stringify(expectedRssLinks)) {
  fail("RSS is not the latest 20 numeric Blog Articles")
}

const robots = await fs.readFile(path.join(publicRoot, "robots.txt"), "utf8")
if (!robots.includes("Allow: /") || !robots.includes(`${siteOrigin}/sitemap.xml`)) {
  fail("robots.txt does not allow the site and advertise the production sitemap")
}

const manifest = JSON.parse(
  await fs.readFile(path.join(repositoryRoot, "scripts", "gatsby-migration-manifest.json"), "utf8"),
)
const aliases = manifest.documents.flatMap((document) => document.requiredAliases ?? [])
const contentIndexFiles = (await fs.readdir(path.join(publicRoot, "static"))).filter((name) =>
  /^contentIndex-[0-9a-f]{16}\.json$/.test(name),
)
if (contentIndexFiles.length !== 1) {
  fail(`Expected one content-addressed Search index, found ${contentIndexFiles.length}`)
}
const contentIndex = JSON.parse(
  await fs.readFile(path.join(publicRoot, "static", contentIndexFiles[0] ?? "missing"), "utf8"),
)
const duplicateAliases = aliases.filter((alias) => alias.replace(/^\/+|\/+$/g, "") in contentIndex)
if (duplicateAliases.length !== 0)
  fail(`${duplicateAliases.length} aliases duplicate Search entries`)

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`)
  process.exitCode = 1
} else {
  console.log(`Production validation passed:`)
  console.log(`- ${articles.length} Blog Articles; ${compositionMismatches} composition mismatches`)
  console.log(
    `- ${renderedArticleContexts} metadata-driven article contexts; ${contextMismatches} mismatches`,
  )
  console.log(
    `- Learning Archive contexts: ${renderedLearningArchiveContexts.gatsby} Gatsby, ${renderedLearningArchiveContexts["google-domains"]} Google Domains, ${renderedLearningArchiveContexts.gsutil} gsutil`,
  )
  console.log(
    `- ${numbered.length} numeric chronology entries; ${neighborMismatches} neighbor mismatches`,
  )
  console.log(`- ${sitemapUrls.length} sitemap pages; ${metadataMismatches} metadata mismatches`)
  console.log(`- ${rssLinks.length} article-only RSS items; robots.txt present`)
  console.log(`- ${aliases.length} historical aliases excluded from Search`)
}
