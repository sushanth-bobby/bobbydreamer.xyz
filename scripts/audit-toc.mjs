import fs from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import { unified } from "unified"
import remarkParse from "remark-parse"
import { parse as parseYaml } from "yaml"

const args = new Map()
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1])
}

const publicRoot = path.resolve(args.get("--public") ?? "public")
const outputPath = args.get("--output")
if (!outputPath)
  throw new Error("Usage: node scripts/audit-toc.mjs --public public --output <file>")

function frontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  return match ? parseYaml(match[1]) : {}
}

async function markdownFiles(directory) {
  const files = []
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await markdownFiles(entryPath)))
    else if (entry.name.endsWith(".md")) files.push(entryPath)
  }
  return files
}

const nonArticleRoutes =
  /^(?:(?:index|til(?:\/index)?|bio(?:\/index)?|irevere(?:\/index)?|music(?:\/index)?)$|(?:blog|topics|tags)(?:\/|$))/

function isBlogArticle(markdownPath, data) {
  const slug = path.relative("content", markdownPath).replace(/\.md$/, "").replaceAll("\\", "/")
  const date = new Date(data.date)
  return !nonArticleRoutes.test(slug) && !Number.isNaN(date.getTime())
}

function headingCounts(markdown) {
  const tree = unified().use(remarkParse).parse(markdown)
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  const visit = (node) => {
    if (node.type === "heading") counts[node.depth] += 1
    if (Array.isArray(node.children)) node.children.forEach(visit)
  }
  visit(tree)
  return counts
}

const rows = []
for (const markdownPath of await markdownFiles("content")) {
  const markdown = await fs.readFile(markdownPath, "utf8")
  const data = frontmatter(markdown)
  if (!isBlogArticle(markdownPath, data)) continue

  const relativePath = path.relative("content", markdownPath)
  const counts = headingCounts(markdown)
  const eligible = counts[1] + counts[2] + counts[3]
  const tocEnabled = data.enableToc !== false
  const expected = tocEnabled && eligible > 1
  const generatedPath =
    path.basename(relativePath) === "index.md"
      ? path.join(publicRoot, path.dirname(relativePath), "index.html")
      : path.join(publicRoot, relativePath.replace(/\.md$/, ".html"))
  const html = await fs.readFile(generatedPath, "utf8")
  const rendered = /<div class="toc(?:\s|\")/.test(html)
  rows.push({
    sequence: Number(relativePath.match(/^(\d+)/)?.[1]) || undefined,
    path: `/${path.dirname(relativePath).replaceAll("\\", "/")}/`,
    title: data.title ?? relativePath,
    counts,
    eligible,
    expected,
    rendered,
    result: expected === rendered ? "match" : expected ? "missing" : "unexpected",
  })
}

rows.sort(
  (left, right) =>
    (right.sequence ?? Number.NEGATIVE_INFINITY) - (left.sequence ?? Number.NEGATIVE_INFINITY) ||
    left.path.localeCompare(right.path),
)

const bucket = (predicate) => rows.filter(predicate).length
const expectedCount = bucket((row) => row.expected)
const renderedCount = bucket((row) => row.rendered)
const escapeCell = (value) => String(value).replaceAll("|", "\\|").replaceAll("\n", " ")
const lines = [
  "# Quartz 5 — Phase 4C TOC Audit",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## Effective rule",
  "",
  "- Eligible Markdown heading levels: H1, H2, and H3.",
  "- Ineligible levels: H4, H5, and H6.",
  "- Native Quartz option: `minEntries: 1`; implementation comparison: `toc.length > minEntries`.",
  "- Effective minimum: 2 qualifying headings, including nested H2/H3 headings.",
  "- Local layout condition: Blog Articles only; numeric sequence is not the presentation classifier.",
  "",
  "## Aggregate",
  "",
  `- Blog articles: ${rows.length}`,
  `- 0 qualifying headings: ${bucket((row) => row.eligible === 0)}`,
  `- 1 qualifying heading: ${bucket((row) => row.eligible === 1)}`,
  `- 2 qualifying headings: ${bucket((row) => row.eligible === 2)}`,
  `- 3+ qualifying headings: ${bucket((row) => row.eligible >= 3)}`,
  `- Posts containing H1: ${bucket((row) => row.counts[1] > 0)}`,
  `- Posts containing H2: ${bucket((row) => row.counts[2] > 0)}`,
  `- Posts containing H3: ${bucket((row) => row.counts[3] > 0)}`,
  `- Posts containing H4+: ${bucket((row) => row.counts[4] + row.counts[5] + row.counts[6] > 0)}`,
  `- TOC expected: ${expectedCount}`,
  `- TOC rendered: ${renderedCount}`,
  `- Expected but missing: ${bucket((row) => row.result === "missing")}`,
  `- Unexpectedly rendered: ${bucket((row) => row.result === "unexpected")}`,
  "",
  "## Per-post audit",
  "",
  "| sequence | path | title | H1 | H2 | H3 | H4+ | eligible | expected | rendered | result |",
  "| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |",
]

for (const row of rows) {
  lines.push(
    `| ${row.sequence ?? "—"} | ${row.path} | ${escapeCell(row.title)} | ${row.counts[1]} | ${row.counts[2]} | ${row.counts[3]} | ${row.counts[4] + row.counts[5] + row.counts[6]} | ${row.eligible} | ${row.expected ? "yes" : "no"} | ${row.rendered ? "yes" : "no"} | ${row.result} |`,
  )
}

await fs.writeFile(path.resolve(outputPath), `${lines.join("\n")}\n`)
console.log(
  JSON.stringify(
    {
      posts: rows.length,
      zero: bucket((row) => row.eligible === 0),
      one: bucket((row) => row.eligible === 1),
      two: bucket((row) => row.eligible === 2),
      threePlus: bucket((row) => row.eligible >= 3),
      h1: bucket((row) => row.counts[1] > 0),
      h2: bucket((row) => row.counts[2] > 0),
      h3: bucket((row) => row.counts[3] > 0),
      h4Plus: bucket((row) => row.counts[4] + row.counts[5] + row.counts[6] > 0),
      expected: expectedCount,
      rendered: renderedCount,
      missing: bucket((row) => row.result === "missing"),
      unexpected: bucket((row) => row.result === "unexpected"),
    },
    null,
    2,
  ),
)
