import fs from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import { pathToFileURL } from "node:url"
import { unified } from "unified"
import remarkParse from "remark-parse"
import { parse as parseYaml } from "yaml"

export const contentStatuses = ["current", "historical", "superseded", "point-in-time"]
export const learningArchiveContexts = ["gatsby", "google-domains", "gsutil"]

const reservedRoutes =
  /^(?:(?:index|til(?:\/index)?|bio(?:\/index)?|irevere(?:\/index)?|music(?:\/index)?)$|(?:blog|topics|tags)(?:\/|$))/

const technologyPatterns = [
  ["Apache Beam", /\bApache Beam\b|\bapache_beam\b/i],
  ["BigQuery", /\bBigQuery\b|google\.cloud import bigquery/i],
  ["Caddy", /\bCaddy\b/i],
  ["Cloud Functions", /\bCloud Functions?\b|gcloud functions deploy/i],
  ["Cloud Run", /\bCloud Run\b/i],
  ["Cloud Storage", /\bCloud Storage\b|\bGCS\b|\bgsutil\b|gcloud storage/i],
  ["CSS", /\bCSS\b/i],
  ["Db2", /\bDB2\b|\bDb2\b/],
  ["Docker", /\bDocker\b|\bDockerfile\b/i],
  ["Express", /\bExpress(?:JS|\.js)?\b|require\(["']express["']\)/i],
  ["Firebase", /\bFirebase\b|firebase-admin|firebase-functions/i],
  ["Gatsby", /\bGatsby(?:JS)?\b|gatsby-/i],
  ["Git", /\bGit(?:Hub)?\b|\bgit\s+(?:add|commit|checkout|merge|rebase)\b/i],
  ["Google Cloud", /\bGoogle Cloud\b|\bGCP\b|\bgcloud\b/i],
  ["HTML", /\bHTML\b/i],
  ["Java", /\bJava\b|\bMaven\b/i],
  ["JavaScript", /\bJavaScript\b|\bNodeJS\b|\bNode\.js\b/i],
  ["jQuery", /\bjQuery\b/i],
  ["JWT", /\bJWT\b|jsonwebtoken/i],
  ["MySQL", /\bMySQL\b/i],
  ["Node.js", /\bNodeJS\b|\bNode\.js\b|\bnpm\b/i],
  ["Pandas", /\bPandas\b|\bpandas\b/i],
  ["Puppeteer", /\bPuppeteer\b/i],
  ["Python", /\bPython\b|\bpip3?\b/i],
  ["Quartz", /\bQuartz\b/i],
  ["React", /\bReact\b|from ["']react["']/i],
  ["TLS", /\bTLS\b|\bSSL\b|Transport Layer Security|Secure Sockets Layer/i],
  ["Windows", /\bWindows\b|\bPowerShell\b|\brobocopy\b/i],
]

const topicRules = [
  {
    id: "technology-and-building",
    tags: new Set([
      "bigquery",
      "cloud-shell",
      "commands",
      "db2-locks",
      "db2-notes",
      "db2-statistics",
      "db2-tablespace",
      "deployment",
      "expressjs",
      "file-sync",
      "firebase",
      "gatsbyjs",
      "gcp",
      "gcs",
      "git",
      "gsutil",
      "hosting",
      "it-skills",
      "java",
      "javascript",
      "jquery",
      "jupyter",
      "mainframe",
      "maven",
      "mysql",
      "nodejs",
      "numpy",
      "pandas",
      "profiler",
      "python",
      "quartz",
      "scraping",
      "security",
      "shell",
      "sre",
      "static-site-generator",
      "unix",
      "web-development",
      "windows",
    ]),
  },
  {
    id: "investment-learning-and-journal",
    tags: new Set(["quest-for-wealth", "stocks"]),
    title: /\b(?:qfw|stock|wealth|invest|buffett|munger|market|valuation)\b/i,
  },
  {
    id: "personal-learning-and-reflection",
    tags: new Set([
      "decisions",
      "enlightment",
      "happy",
      "nfwyt",
      "notes",
      "personal-development",
      "self",
      "time-wasted",
    ]),
  },
  {
    id: "food-health-and-life",
    tags: new Set(["foods", "health", "juice", "moms-food-recipe", "music"]),
  },
]

function frontmatter(markdown) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(markdown)
  return {
    data: match ? (parseYaml(match[1]) ?? {}) : {},
    body: match ? markdown.slice(match[0].length) : markdown,
  }
}

async function listFiles(directory, predicate = () => true) {
  const result = []
  async function visit(current) {
    for (const entry of await fs.readdir(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name)
      if (entry.isDirectory()) await visit(entryPath)
      else if (predicate(entryPath)) result.push(entryPath)
    }
  }
  await visit(directory)
  return result.sort()
}

function textOf(node) {
  if (typeof node.value === "string") return node.value
  if (!Array.isArray(node.children)) return ""
  return node.children.map(textOf).join("")
}

function normalizeTag(tag) {
  return String(tag)
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
}

function canonicalPath(slug) {
  if (slug === "index") return "/"
  if (slug.endsWith("/index")) return `/${slug.slice(0, -"/index".length)}/`
  return `/${slug}`
}

function classifyPage(slug, data) {
  if (slug === "index") return "home"
  if (/^(?:bio|irevere|music|til)(?:\/index)?$/.test(slug)) return "static"
  const date = new Date(data.date)
  if (!reservedRoutes.test(slug) && !Number.isNaN(date.getTime())) return "blog-article"
  return "other"
}

function sequenceFromSlug(slug) {
  const match = /^(\d+)[-.]/.exec(slug)
  return match ? Number(match[1]) : undefined
}

function topicSignals(tags, title) {
  const normalized = new Set(tags.map(normalizeTag))
  return topicRules
    .filter((rule) => [...normalized].some((tag) => rule.tags.has(tag)) || rule.title?.test(title))
    .map((rule) => rule.id)
}

function countBy(values) {
  return Object.fromEntries(
    [
      ...values.reduce(
        (counts, value) => counts.set(value, (counts.get(value) ?? 0) + 1),
        new Map(),
      ),
    ].sort(([left], [right]) => String(left).localeCompare(String(right))),
  )
}

function summarize(documents) {
  const rawTags = documents.flatMap((document) => document.tags)
  const normalizedTags = documents.flatMap((document) => document.normalizedTags)
  const technologies = documents.flatMap((document) => document.technologyProductReferences)
  const topics = documents.flatMap((document) =>
    document.topicSignals.length > 0 ? document.topicSignals : ["unclassified"],
  )
  return {
    documents: documents.length,
    blogArticles: documents.filter((document) => document.pageType === "blog-article").length,
    numberedArticles: documents.filter((document) => document.sequence !== undefined).length,
    migratedDocuments: documents.filter((document) => document.provenance === "migrated").length,
    authoredDocuments: documents.filter((document) => document.provenance === "authored").length,
    words: documents.reduce((total, document) => total + document.wordCount, 0),
    colocatedAssets: documents.reduce((total, document) => total + document.assets.length, 0),
    imageReferences: documents.reduce((total, document) => total + document.images.length, 0),
    internalLinks: documents.reduce((total, document) => total + document.internalLinks.length, 0),
    externalLinks: documents.reduce((total, document) => total + document.externalLinks.length, 0),
    codeBlocks: documents.reduce((total, document) => total + document.codeBlocks.length, 0),
    tocEligible: documents.filter((document) => document.tocEligible).length,
    rawTagCount: new Set(rawTags).size,
    normalizedTagCount: new Set(normalizedTags).size,
    byYear: countBy(documents.map((document) => document.year ?? "undated")),
    byPageType: countBy(documents.map((document) => document.pageType)),
    byStatus: countBy(documents.map((document) => document.status)),
    learningArchiveArticles: documents.filter((document) => document.status === "historical")
      .length,
    byLearningArchiveContext: countBy(
      documents.flatMap((document) => document.learningArchiveContexts),
    ),
    overlappingLearningArchiveContexts: documents.filter(
      (document) => document.learningArchiveContexts.length > 1,
    ).length,
    byTopicSignal: countBy(topics),
    tags: countBy(rawTags),
    normalizedTags: countBy(normalizedTags),
    technologyProductReferences: countBy(technologies),
  }
}

export function validateEditorialFrontmatter(document) {
  const errors = []
  if (!contentStatuses.includes(document.status)) {
    errors.push(`${document.relativePath}: unsupported status "${document.status}"`)
  }
  if (document.status === "superseded" && !document.supersededBy) {
    errors.push(`${document.relativePath}: superseded content requires supersededBy`)
  }
  if (document.status !== "superseded" && document.supersededBy) {
    errors.push(`${document.relativePath}: supersededBy is valid only with status: superseded`)
  }
  if (document.authorship !== "user" && document.authorship !== "ai") {
    errors.push(`${document.relativePath}: authorship must be omitted or set to ai`)
  }
  if (document.learningArchiveContexts.length > 0 && document.status !== "historical") {
    errors.push(`${document.relativePath}: learningArchiveContexts requires status: historical`)
  }
  if (new Set(document.learningArchiveContexts).size !== document.learningArchiveContexts.length) {
    errors.push(`${document.relativePath}: learningArchiveContexts must not contain duplicates`)
  }
  for (const context of document.learningArchiveContexts) {
    if (!learningArchiveContexts.includes(context)) {
      errors.push(`${document.relativePath}: unsupported Learning Archive context "${context}"`)
    }
  }
  for (const tag of document.tags) {
    if (/^\d+$/.test(String(tag))) {
      errors.push(`${document.relativePath}: numeric tag "${tag}" is not allowed`)
    }
    if (normalizeTag(tag) === "wai") {
      errors.push(`${document.relativePath}: use authorship: ai instead of the wai taxonomy tag`)
    }
  }
  return errors
}

export async function buildCorpusInventory({
  contentRoot,
  manifestPath,
  asOf = new Date().toISOString().slice(0, 10),
}) {
  const root = path.resolve(contentRoot)
  const manifest = manifestPath
    ? JSON.parse(await fs.readFile(path.resolve(manifestPath), "utf8"))
    : { documents: [] }
  const migrated = new Map(
    (manifest.documents ?? []).map((document) => [
      String(document.quartzDestination).replaceAll("\\", "/"),
      document,
    ]),
  )
  const asOfTime = new Date(`${asOf}T00:00:00Z`).getTime()
  if (Number.isNaN(asOfTime)) throw new Error(`Invalid --as-of date: ${asOf}`)

  const markdownFiles = await listFiles(root, (filePath) => filePath.endsWith(".md"))
  const documents = []
  const errors = []

  for (const filePath of markdownFiles) {
    const markdown = await fs.readFile(filePath, "utf8")
    const { data, body } = frontmatter(markdown)
    const relativePath = path.relative(root, filePath).replaceAll(path.sep, "/")
    const slug = relativePath.replace(/\.md$/, "")
    const tree = unified().use(remarkParse).parse(body)
    const headings = []
    const images = []
    const internalLinks = []
    const externalLinks = []
    const codeBlocks = []
    const prose = []

    function visit(node, inCode = false) {
      if (node.type === "heading") headings.push({ depth: node.depth, text: textOf(node) })
      if (node.type === "image") {
        images.push({
          url: node.url,
          alt: node.alt ?? "",
          kind: /^https?:\/\//i.test(node.url) ? "external" : "local",
        })
      }
      if (node.type === "link") {
        const entry = { url: node.url, text: textOf(node) }
        if (/^(?:https?:)?\/\//i.test(node.url)) externalLinks.push(entry)
        else internalLinks.push(entry)
      }
      if (node.type === "code") {
        codeBlocks.push({
          language: node.lang ?? null,
          meta: node.meta ?? null,
          lines: node.value ? node.value.split(/\r?\n/).length : 0,
        })
      }
      if (node.type === "text" && !inCode) prose.push(node.value)
      if (Array.isArray(node.children)) {
        const childInCode = inCode || node.type === "code" || node.type === "inlineCode"
        for (const child of node.children) visit(child, childInCode)
      }
    }
    visit(tree)

    const directoryEntries = await fs.readdir(path.dirname(filePath), { withFileTypes: true })
    const assets = directoryEntries
      .filter((entry) => entry.isFile() && entry.name !== path.basename(filePath))
      .map((entry) => entry.name)
      .sort()
    const tags = Array.isArray(data.tags) ? data.tags.map(String) : []
    const normalizedTags = [...new Set(tags.map(normalizeTag))]
    const title = String(data.title ?? relativePath)
    const date = data.date ? String(data.date).slice(0, 10) : null
    const parsedDate = date ? new Date(`${date}T00:00:00Z`) : undefined
    const qualifyingHeadings = headings.filter((heading) => heading.depth <= 3).length
    const source = migrated.get(relativePath)
    const searchableText = `${title}\n${body}`
    const technologyProductReferences = technologyPatterns
      .filter(([, pattern]) => pattern.test(searchableText))
      .map(([label]) => label)
    const status = data.status === undefined ? "current" : String(data.status)
    const authorship = data.authorship === undefined ? "user" : String(data.authorship)
    const articleLearningArchiveContexts = Array.isArray(data.learningArchiveContexts)
      ? data.learningArchiveContexts.map(String)
      : []
    const document = {
      sequence: sequenceFromSlug(slug),
      canonicalPath: canonicalPath(slug),
      relativePath,
      title,
      description: data.description === undefined ? null : String(data.description),
      date,
      year: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.getUTCFullYear() : null,
      articleAgeDays:
        parsedDate && !Number.isNaN(parsedDate.getTime())
          ? Math.floor((asOfTime - parsedDate.getTime()) / 86_400_000)
          : null,
      tags,
      normalizedTags,
      pageType: classifyPage(slug, data),
      contentType: source?.contentType ?? (slug === "index" ? "home" : "authored"),
      provenance: source ? "migrated" : "authored",
      wordCount: prose.join(" ").trim().split(/\s+/u).filter(Boolean).length,
      headings,
      tocEligible:
        classifyPage(slug, data) === "blog-article" &&
        data.enableToc !== false &&
        qualifyingHeadings > 1,
      images,
      assets,
      internalLinks,
      externalLinks,
      codeBlocks,
      technologyProductReferences,
      topicSignals: topicSignals(tags, title),
      status,
      supersededBy: data.supersededBy === undefined ? null : String(data.supersededBy),
      authorship,
      learningArchiveContexts: articleLearningArchiveContexts,
      aliases: Array.isArray(data.aliases) ? data.aliases.map(String) : [],
    }
    errors.push(...validateEditorialFrontmatter(document))
    documents.push(document)
  }

  documents.sort(
    (left, right) =>
      (right.sequence ?? Number.NEGATIVE_INFINITY) - (left.sequence ?? Number.NEGATIVE_INFINITY) ||
      left.canonicalPath.localeCompare(right.canonicalPath),
  )

  return {
    schemaVersion: 1,
    asOf,
    contentRoot: path.basename(root),
    summary: summarize(documents),
    errors,
    documents,
  }
}

function argsFrom(argv) {
  const values = new Map()
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index]
    if (!key.startsWith("--")) continue
    const next = argv[index + 1]
    if (!next || next.startsWith("--")) values.set(key, true)
    else {
      values.set(key, next)
      index += 1
    }
  }
  return values
}

async function main() {
  const args = argsFrom(process.argv.slice(2))
  const inventory = await buildCorpusInventory({
    contentRoot: args.get("--content") ?? "content",
    manifestPath: args.get("--manifest") ?? "scripts/gatsby-migration-manifest.json",
    asOf: args.get("--as-of") ?? new Date().toISOString().slice(0, 10),
  })
  const output = args.get("--json")
  if (typeof output === "string") {
    await fs.writeFile(path.resolve(output), `${JSON.stringify(inventory, null, 2)}\n`)
  }
  console.log(JSON.stringify({ ...inventory.summary, errors: inventory.errors }, null, 2))
  if (inventory.errors.length > 0) process.exitCode = 1
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  await main()
}
