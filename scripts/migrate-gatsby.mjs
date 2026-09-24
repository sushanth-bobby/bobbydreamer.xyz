import crypto from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { slugTag } from "@quartz-community/utils"
import GithubSlugger from "github-slugger"
import { format as formatWithPrettier, resolveConfig as resolvePrettierConfig } from "prettier"
import YAML from "yaml"

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.dirname(scriptDirectory)

export const migrationExceptions = {
  "posts/24-things-that-my-new-site-should-have/index.mdx": {
    assetReplacements: {
      "./of10.png": "./of10a.png",
    },
    reason:
      "The referenced of10.png is absent from every source copy. The colocated of10a.png is the unambiguous thebalance.com screenshot named by the image alt text; of10b.png depicts the separately linked Ross Whitehouse site.",
  },
  "posts/52-sre-reliability-engineering/index.mdx": {
    removeMissingImages: ["./sreh.jpeg", "./tbs.jpeg"],
    reason:
      "Both image files are absent from the authoritative corpus, the earlier Gatsby workspaces, and available Gatsby Git history. No candidate asset exists, so only the two already-broken image nodes are omitted.",
  },
  "posts/26-mysql-tips-and-tricks/index.mdx": {
    bodyReplacements: [{ from: '<a id="bl11"></a>', to: '<a id="bl12"></a>', occurrence: 1 }],
    reason:
      "The first of two duplicate bl11 anchors heads the section linked as bl12; restoring that unique anchor repairs the local table-of-contents target.",
  },
  "posts/32-python-creating-dataframes/index.mdx": {
    bodyReplacements: [{ from: '<a id="df10"></a>', to: '<a id="df11"></a>', occurrence: 2 }],
    reason:
      "The second of two duplicate df10 anchors heads the section linked as df11; restoring that unique anchor repairs the local table-of-contents target.",
  },
  "posts/43-upgrading-gatsby-site/index.mdx": {
    bodyReplacements: [
      {
        from: "(./deploying-and-hosting-gatsby-site-in-firebase)",
        to: "(/deploying-and-hosting-gatsby-site-in-firebase/)",
        occurrence: 1,
      },
    ],
    reason:
      "The relative target incorrectly resolves below post 43. Its exact Gatsby slug uniquely identifies post 11, so it is rewritten to that historical route.",
  },
  "posts/57-firebase-rules/index.mdx": {
    bodyReplacements: [
      {
        from: "./fbc2.png",
        to: "/57-firebase-rules/fbc2.png",
        occurrence: 1,
      },
    ],
    reason:
      "fbc2.png also exists in post 58. Quartz shortest-link resolution drops the owning folder for the ambiguous basename, so this reference is pinned to its colocated emitted path.",
  },
  "posts/58-firebase-basics-to-events/index.mdx": {
    bodyReplacements: [
      {
        from: "./fbc2.png",
        to: "/58-firebase-basics-to-events/fbc2.png",
        occurrence: 1,
      },
    ],
    reason:
      "fbc2.png also exists in post 57. Quartz shortest-link resolution drops the owning folder for the ambiguous basename, so this reference is pinned to its colocated emitted path.",
  },
  "posts/60-qfw-charlie-munger/index.mdx": {
    escapeCurrencyDollars: true,
    reason:
      "Currency dollar signs were parsed as inline-math delimiters across prose containing curly punctuation. Escaping only currency markers preserves the visible text and prevents false KaTeX input.",
  },
  "posts/90-5ac-robin-sharma/index.mdx": {
    escapeNumericOrdinals: true,
    reason:
      "The authored #1 through #5 markers are prose ordinals, not frontmatter taxonomy. Quartz inline-tag parsing promoted them into accidental numeric tags, so only these visible ordinal hashes are escaped.",
  },
  "posts/92-naval-ravikant-the-angel-philosopher/index.mdx": {
    escapeCurrencyDollars: true,
    reason:
      "Currency dollar signs were parsed as inline-math delimiters across prose containing curly punctuation. Escaping only currency markers preserves the visible text and prevents false KaTeX input.",
  },
  "posts/93-wb-and-cm-faqs/index.mdx": {
    escapeCurrencyDollars: true,
    reason:
      "Currency dollar signs were parsed as inline-math delimiters across prose containing percent signs and curly punctuation. Escaping only currency markers preserves the visible text and prevents false KaTeX input.",
  },
  "posts/94-qfw-wb-management-secrets/index.mdx": {
    escapeCurrencyDollars: true,
    reason:
      "Currency dollar signs were parsed as inline-math delimiters across prose containing a percent sign. Escaping only currency markers preserves the visible text and prevents false KaTeX input.",
  },
  "posts/95-qfw-tao-of-warren-buffett/index.mdx": {
    escapeCurrencyDollars: true,
    reason:
      "Currency dollar signs were parsed as inline-math delimiters across prose containing percent signs and curly punctuation. Escaping only currency markers preserves the visible text and prevents false KaTeX input.",
  },
  "posts/120-maven-creating-fat-aka-uber-jar/index.mdx": {
    bodyReplacements: [
      {
        from: "./uber1.png",
        to: "/120-maven-creating-fat-aka-uber-jar/uber1.png",
        occurrence: 1,
      },
    ],
    reason:
      "uber1.png also exists in post 121. Quartz shortest-link resolution drops the owning folder for the ambiguous basename, so this reference is pinned to its colocated emitted path.",
  },
  "posts/140-ego-is-the-enemy/index.mdx": {
    escapeCurrencyDollars: true,
    reason:
      "Currency dollar signs were parsed as inline-math delimiters across prose containing an em dash. Escaping only currency markers preserves the visible text and prevents false KaTeX input.",
  },
}

export function normalizeWebPath(value) {
  return String(value)
    .replaceAll("\\", "/")
    .replace(/^\/+|\/+$/g, "")
}

export function splitFrontmatter(source, sourceName = "content") {
  const match = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/)
  if (!match) throw new Error(`${sourceName}: expected YAML frontmatter`)
  return { data: YAML.parse(match[1]) ?? {}, body: source.slice(match[0].length) }
}

function splitFencedSegments(markdown) {
  const lines = markdown.match(/.*(?:\r?\n|$)/g)?.filter(Boolean) ?? []
  const segments = []
  let fenced = false
  let fenceMarker = ""
  let current = ""

  for (const line of lines) {
    const marker = line.match(/^\s*(`{3,}|~{3,})/)?.[1]
    const nextFenced =
      marker && !fenced ? true : marker && fenced && marker[0] === fenceMarker[0] ? false : fenced
    const lineIsFence = Boolean(marker)
    const lineFenced = fenced || lineIsFence

    if (segments.length && segments.at(-1).fenced !== lineFenced) {
      segments.push({ fenced: lineFenced, text: line })
    } else if (segments.length) {
      segments.at(-1).text += line
    } else {
      segments.push({ fenced: lineFenced, text: line })
    }

    if (marker && !fenced) fenceMarker = marker
    fenced = nextFenced
    if (!fenced) fenceMarker = ""
  }

  return segments
}

export function withoutFencedCode(markdown) {
  return splitFencedSegments(markdown)
    .map((segment) => (segment.fenced ? "" : segment.text))
    .join("")
    .split(/\r?\n/)
    .map((line) => (/^(?: {4}|\t)/.test(line) ? "" : line))
    .join("\n")
}

function withoutInlineCode(markdown) {
  return markdown.replace(/(`+)([\s\S]*?)\1/g, "")
}

function transformOutsideFences(markdown, transform) {
  return splitFencedSegments(markdown)
    .map((segment) => (segment.fenced ? segment.text : transform(segment.text)))
    .join("")
}

function transformOutsideInlineCode(line, transform) {
  const pattern = /(`+)([^`]*?)\1/g
  let output = ""
  let offset = 0
  for (const match of line.matchAll(pattern)) {
    output += transform(line.slice(offset, match.index))
    output += match[0]
    offset = match.index + match[0].length
  }
  return output + transform(line.slice(offset))
}

function transformMarkdownProse(markdown, transform) {
  return transformOutsideFences(markdown, (segment) =>
    segment
      .split(/(?<=\n)/)
      .map((line) =>
        /^(?: {4}|\t)/.test(line) ? line : transformOutsideInlineCode(line, transform),
      )
      .join(""),
  )
}

export function escapeNumericOrdinalTags(body) {
  let count = 0
  const output = transformMarkdownProse(body, (prose) =>
    prose.replace(/(?<!\\)#([1-5])\b/g, (_match, ordinal) => {
      count += 1
      return `\\#${ordinal}`
    }),
  )
  return { body: output, count }
}

export function escapeCurrencyDollars(body) {
  let count = 0
  const output = transformMarkdownProse(body, (prose) =>
    prose.replace(/(?<!\\)\$(?=\d)/g, () => {
      count += 1
      return "\\$"
    }),
  )
  return { body: output, count }
}

export function removeSpotifyComponents(body) {
  return transformOutsideFences(body, (segment) => {
    const withoutImports = segment.replace(
      /^\s*import\s+SpotifyPlayer\s+from\s+["'][^"']+["'];?\s*$/gm,
      "",
    )
    return withoutImports.replace(/<SpotifyPlayer\b[\s\S]*?\/>/g, "")
  })
}

export function normalizeReactLiveMetadata(body) {
  return body.replace(/^(\s*```[A-Za-z0-9_-]+)\s+react-live\s*$/gm, "$1")
}

export function normalizeLocalAssetCasing(body, assetNames = []) {
  const actualNames = new Map(assetNames.map((name) => [name.toLowerCase(), name]))
  return transformOutsideFences(body, (segment) =>
    segment.replace(/(!?\[[^\]]*\]\()([^\s)]+)([^)]*\))/g, (match, prefix, target, suffix) => {
      if (!target.startsWith("./")) return match
      const [pathPart, tail = ""] = target.split(/(?=[?#])/, 2)
      const requestedName = pathPart.slice(2)
      const actualName = actualNames.get(requestedName.toLowerCase())
      return actualName ? `${prefix}./${actualName}${tail}${suffix}` : match
    }),
  )
}

export function normalizeTableSeparators(body) {
  const lines = body.split("\n")
  let inFence = false
  let marker = ""
  for (let index = 0; index < lines.length - 1; index += 1) {
    const fence = lines[index].match(/^\s*(`{3,}|~{3,})/)?.[1]
    if (fence && !inFence) {
      inFence = true
      marker = fence[0]
      continue
    }
    if (fence && inFence && fence[0] === marker) {
      inFence = false
      marker = ""
      continue
    }
    if (inFence) continue

    const header = lines[index].match(/^(\s*)\|(.*)\|\s*$/)
    const separator = lines[index + 1].match(/^\s*\|(.*)\|\s*$/)
    if (!header || !separator) continue
    const headerCells = header[2].split("|")
    const separatorCells = separator[1].split("|").map((cell) => cell.trim())
    if (!separatorCells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue
    if (headerCells.length === separatorCells.length) continue
    const normalizedCells = headerCells.map(
      (_cell, cellIndex) => separatorCells[cellIndex] ?? "---",
    )
    lines[index + 1] = `${header[1]}| ${normalizedCells.join(" | ")} |`
  }
  return lines.join("\n")
}

function replaceKnownMissingAssets(body, sourcePath) {
  const exception = migrationExceptions[sourcePath]
  let output = body
  let replacements = 0
  let removals = 0

  for (const [missing, replacement] of Object.entries(exception?.assetReplacements ?? {})) {
    const escaped = missing.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    output = transformOutsideFences(output, (segment) =>
      segment.replace(new RegExp(escaped, "g"), () => {
        replacements += 1
        return replacement
      }),
    )
  }

  for (const missing of exception?.removeMissingImages ?? []) {
    output = transformOutsideFences(output, (segment) => {
      const escaped = missing.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const imagePattern = new RegExp(`!?\\[[^\\]]*\\]\\(${escaped}(?:\\s+["'][^"']*["'])?\\)`, "g")
      return segment.replace(imagePattern, () => {
        removals += 1
        return `<!-- Gatsby migration omitted unavailable source image ${missing}. -->`
      })
    })
  }

  return { body: output, replacements, removals }
}

function replaceOccurrence(value, from, to, occurrence) {
  let seen = 0
  return value.replaceAll(from, (match) => {
    seen += 1
    return seen === occurrence ? to : match
  })
}

function applyKnownBodyRepairs(body, sourcePath) {
  let output = body
  let explicit = 0
  for (const repair of migrationExceptions[sourcePath]?.bodyReplacements ?? []) {
    const before = output
    output = replaceOccurrence(output, repair.from, repair.to, repair.occurrence ?? 1)
    if (output === before)
      throw new Error(`${sourcePath}: expected explicit repair input not found: ${repair.from}`)
    explicit += 1
  }

  let angleBracketProse = 0
  output = transformOutsideFences(output, (segment) =>
    segment.replace(/^\s*<<([^\n]+)>>\s*$/gm, (_match, text) => {
      angleBracketProse += 1
      return `&lt;&lt;${text}&gt;&gt;`
    }),
  )

  let malformedExternalLink = 0
  output = transformOutsideFences(output, (segment) =>
    segment.replace(/\.\/(https?:\/\/)/g, (_match, protocol) => {
      malformedExternalLink += 1
      return protocol
    }),
  )

  let malformedMarkdownLink = 0
  output = transformOutsideFences(output, (segment) =>
    segment.replace(/\]\(\((https?:\/\/[^)]+)\)\)/g, (_match, target) => {
      malformedMarkdownLink += 1
      return `](${target})`
    }),
  )

  let numericOrdinalEscape = 0
  if (migrationExceptions[sourcePath]?.escapeNumericOrdinals) {
    const escaped = escapeNumericOrdinalTags(output)
    output = escaped.body
    numericOrdinalEscape = escaped.count
  }

  let currencyDollarEscape = 0
  if (migrationExceptions[sourcePath]?.escapeCurrencyDollars) {
    const escaped = escapeCurrencyDollars(output)
    output = escaped.body
    currencyDollarEscape = escaped.count
  }

  return {
    body: output,
    counts: {
      explicit,
      angleBracketProse,
      malformedExternalLink,
      malformedMarkdownLink,
      numericOrdinalEscape,
      currencyDollarEscape,
    },
  }
}

export function transformFrontmatter(sourceData, destination) {
  const oldSlug = normalizeWebPath(sourceData.slug ?? "")
  if (!oldSlug) throw new Error(`${destination}: missing Gatsby slug`)
  const transformed = {}
  for (const key of ["title", "date", "description", "tags"]) {
    if (sourceData[key] !== undefined) transformed[key] = sourceData[key]
  }
  if (sourceData.banner !== undefined) transformed.gatsbyBanner = sourceData.banner
  const canonicalSlug = normalizeWebPath(destination).toLowerCase()
  if (oldSlug.toLowerCase() !== canonicalSlug) transformed.aliases = [oldSlug]
  return transformed
}

function countMatches(value, pattern) {
  return [...value.matchAll(pattern)].length
}

export function transformDocument(source, entry, assetNames = []) {
  const { data, body } = splitFrontmatter(source, entry.source)
  const spotifyRemovals = countMatches(withoutFencedCode(body), /<SpotifyPlayer\b/g)
  const reactLiveConversions = countMatches(body, /^\s*```[A-Za-z0-9_-]+\s+react-live\s*$/gm)
  const repairResult = applyKnownBodyRepairs(body, entry.source)
  const exceptionResult = replaceKnownMissingAssets(repairResult.body, entry.source)
  const spotifyBody = removeSpotifyComponents(exceptionResult.body)
  const reactLiveBody = normalizeReactLiveMetadata(spotifyBody)
  const caseBody = normalizeLocalAssetCasing(reactLiveBody, assetNames)
  const assetCaseRepairs = markdownReferences(reactLiveBody).filter((reference) => {
    if (!reference.target.startsWith("./")) return false
    const requested = reference.target.split(/[?#]/, 1)[0].slice(2)
    const actual = assetNames.find((name) => name.toLowerCase() === requested.toLowerCase())
    return actual && actual !== requested
  }).length
  const tableRepairs = countTableRepairs(caseBody)
  const outputBody = normalizeTableSeparators(caseBody).trim()
  const frontmatter = transformFrontmatter(data, entry.destination)
  return {
    output: `---\n${YAML.stringify(frontmatter).trimEnd()}\n---\n\n${outputBody}\n`,
    transformations: {
      spotifyRemoval: spotifyRemovals,
      reactLive: reactLiveConversions,
      tables: tableRepairs,
      assetCase: assetCaseRepairs,
      assetReplacement: exceptionResult.replacements,
      missingImageRemoval: exceptionResult.removals,
      explicitBodyRepair: repairResult.counts.explicit,
      angleBracketProse: repairResult.counts.angleBracketProse,
      malformedExternalLink: repairResult.counts.malformedExternalLink,
      malformedMarkdownLink: repairResult.counts.malformedMarkdownLink,
      numericOrdinalEscape: repairResult.counts.numericOrdinalEscape,
      currencyDollarEscape: repairResult.counts.currencyDollarEscape,
    },
  }
}

function countTableRepairs(body) {
  const normalized = normalizeTableSeparators(body)
  const before = body.split("\n")
  const after = normalized.split("\n")
  return before.reduce((count, line, index) => count + (line === after[index] ? 0 : 1), 0)
}

export function markdownReferences(markdown) {
  const prose = withoutFencedCode(markdown)
  const references = []
  for (const match of prose.matchAll(
    /(!?)\[[^\]]*\]\((<[^>]+>|[^)\s]+)(?:\s+["'][^"']*["'])?\)/g,
  )) {
    references.push({ target: match[2].replace(/^<|>$/g, ""), image: match[1] === "!" })
  }
  for (const match of prose.matchAll(/^\s*\[[^\]]+\]:\s*(<[^>]+>|\S+)/gm)) {
    references.push({ target: match[1].replace(/^<|>$/g, ""), image: false })
  }
  for (const match of prose.matchAll(/<(?:img|source)\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    references.push({ target: match[1], image: true })
  }
  for (const match of prose.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    references.push({ target: match[1], image: false })
  }
  return references
}

function extractAuthoredMdx(body) {
  const prose = withoutInlineCode(withoutFencedCode(body))
  const imports = prose
    .split("\n")
    .filter((line) => /^\s*(?:import|export)\s/.test(line))
    .map((line) => line.trim())
  const components = [...prose.matchAll(/<([A-Z][A-Za-z0-9_.:-]*)\b/g)].map((match) => match[1])
  return { imports, components: [...new Set(components)].sort() }
}

function headingAnchors(body) {
  const slugger = new GithubSlugger()
  const anchors = new Set()
  for (const line of withoutFencedCode(body).split("\n")) {
    const heading = line.match(/^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$/)?.[1]
    if (heading) anchors.add(slugger.slug(heading.replace(/<[^>]+>|[*_`~]/g, "").trim()))
    for (const match of line.matchAll(/\b(?:id|name)=["']([^"']+)["']/gi)) anchors.add(match[1])
  }
  return [...anchors].sort()
}

async function listFiles(directory) {
  const result = []
  async function visit(current) {
    const entries = await fs.readdir(current, { withFileTypes: true })
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) await visit(fullPath)
      else result.push(fullPath)
    }
  }
  await visit(directory)
  return result
}

async function sha256(filePath) {
  return crypto
    .createHash("sha256")
    .update(await fs.readFile(filePath))
    .digest("hex")
}

function routeKey(value) {
  return normalizeWebPath(decodeURIComponent(String(value).split(/[?#]/, 1)[0])).toLowerCase()
}

export function auditRouteCollisions(documents) {
  const errors = []
  const canonicals = new Map()
  const aliases = new Map()
  for (const document of documents) {
    const canonical = routeKey(document.quartzCanonicalUrl)
    if (canonicals.has(canonical)) {
      errors.push(
        `canonical collision /${canonical}/: ${canonicals.get(canonical)} and ${document.sourcePath}`,
      )
    } else canonicals.set(canonical, document.sourcePath)
  }
  for (const document of documents) {
    for (const aliasUrl of document.requiredAliases) {
      const alias = routeKey(aliasUrl)
      const canonical = routeKey(document.quartzCanonicalUrl)
      if (alias === canonical) errors.push(`self redirect /${alias}/ in ${document.sourcePath}`)
      if (canonicals.has(alias) && canonicals.get(alias) !== document.sourcePath) {
        errors.push(
          `alias/canonical collision /${alias}/: ${document.sourcePath} and ${canonicals.get(alias)}`,
        )
      }
      if (aliases.has(alias) && aliases.get(alias) !== document.sourcePath) {
        errors.push(`alias collision /${alias}/: ${aliases.get(alias)} and ${document.sourcePath}`)
      } else aliases.set(alias, document.sourcePath)
    }
  }
  return errors
}

function isExternal(target) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(target)
}

function resolveRouteReference(document, target, routeIndex) {
  if (target.startsWith("#")) {
    return {
      classification: document.anchors.includes(decodeURIComponent(target.slice(1)))
        ? "fragment"
        : "missing-fragment",
      resolvedRoute: document.quartzCanonicalUrl,
    }
  }
  const url = new URL(target, `https://migration.invalid${document.quartzCanonicalUrl}`)
  const key = routeKey(url.pathname)
  const route = routeIndex.get(key)
  if (!route) return { classification: "missing-target", resolvedRoute: null }
  if (route.kind === "generated") {
    return { classification: "generated", resolvedRoute: `/${key}/` }
  }
  const fragment = decodeURIComponent(url.hash.slice(1))
  if (fragment && !route.document.anchors.includes(fragment)) {
    return { classification: "missing-fragment", resolvedRoute: route.document.quartzCanonicalUrl }
  }
  return {
    classification: route.kind === "alias" ? "alias" : fragment ? "fragment" : "canonical",
    resolvedRoute: route.document.quartzCanonicalUrl,
  }
}

function createRouteIndex(documents) {
  const index = new Map()
  for (const document of documents) {
    index.set(routeKey(document.quartzCanonicalUrl), { kind: "canonical", document })
  }
  for (const document of documents) {
    for (const alias of document.requiredAliases) {
      index.set(routeKey(alias), { kind: "alias", document })
    }
  }
  const tags = new Set(
    documents.flatMap((document) =>
      Array.isArray(document.tags) ? document.tags.map((tag) => slugTag(String(tag))) : [],
    ),
  )
  for (const tag of tags)
    index.set(`tags/${tag}`.toLowerCase(), { kind: "generated", document: null })
  return index
}

export async function buildCorpusManifest({ source }) {
  const sourceRoot = path.resolve(source)
  const allFiles = await listFiles(sourceRoot)
  const mdxFiles = allFiles.filter((file) => file.toLowerCase().endsWith(".mdx"))
  const documents = []
  const errors = []

  for (const sourceFile of mdxFiles) {
    const sourcePath = path.relative(sourceRoot, sourceFile).split(path.sep).join("/")
    const match = sourcePath.match(/^(posts|pages)\/([^/]+)\/index\.mdx$/)
    if (!match) {
      errors.push(`${sourcePath}: source document is not a posts/pages folder index`)
      continue
    }
    const contentType = match[1] === "posts" ? "post" : "page"
    const destination = match[2]
    const sourceText = await fs.readFile(sourceFile, "utf8")
    let parsed
    try {
      parsed = splitFrontmatter(sourceText, sourcePath)
    } catch (error) {
      errors.push(error.message)
      continue
    }
    const siblingFiles = allFiles
      .filter((file) => path.dirname(file) === path.dirname(sourceFile) && file !== sourceFile)
      .map((file) => path.basename(file))
      .sort((left, right) => left.localeCompare(right))
    const componentFiles = siblingFiles.filter((name) => name.toLowerCase().endsWith(".js"))
    const localAssets = siblingFiles.filter((name) => !name.toLowerCase().endsWith(".js"))
    const entry = { source: sourcePath, destination }
    let transformed
    try {
      transformed = transformDocument(sourceText, entry, localAssets)
    } catch (error) {
      errors.push(`${sourcePath}: ${error.message}`)
      continue
    }
    const { data: transformedData, body: transformedBody } = splitFrontmatter(
      transformed.output,
      sourcePath,
    )
    const oldSlug = normalizeWebPath(parsed.data.slug ?? "")
    const canonical = `/${normalizeWebPath(destination).toLowerCase()}/`
    const requiredAliases = oldSlug.toLowerCase() === routeKey(canonical) ? [] : [`/${oldSlug}/`]
    const authoredMdx = extractAuthoredMdx(parsed.body)
    const remainingMdx = extractAuthoredMdx(transformedBody)
    const unknownImports = remainingMdx.imports
    const unknownComponents = remainingMdx.components
    if (unknownImports.length)
      errors.push(`${sourcePath}: unknown authored MDX imports: ${unknownImports.join(" | ")}`)
    if (unknownComponents.length)
      errors.push(`${sourcePath}: unknown authored JSX components: ${unknownComponents.join(", ")}`)

    const assetMap = new Map(localAssets.map((name) => [name.toLowerCase(), name]))
    const referencedLocalAssets = []
    const internalLinks = []
    const externalLinks = []
    const references = markdownReferences(transformedBody)
    if (transformedData.gatsbyBanner) {
      references.push({
        target: String(transformedData.gatsbyBanner),
        image: true,
        frontmatter: true,
      })
    }
    for (const reference of references) {
      if (isExternal(reference.target)) {
        externalLinks.push(reference.target)
        continue
      }
      if (reference.image) {
        const decoded = decodeURIComponent(reference.target.split(/[?#]/, 1)[0])
        const ownAbsolutePrefix = `/${destination}/`
        const clean = decoded.startsWith(ownAbsolutePrefix)
          ? decoded.slice(ownAbsolutePrefix.length)
          : decoded.replace(/^\.\//, "")
        const actual = assetMap.get(clean.toLowerCase())
        const classification = actual ? (actual === clean ? "exact" : "case-corrected") : "missing"
        referencedLocalAssets.push({
          target: reference.target,
          actual: actual ?? null,
          classification,
          frontmatter: Boolean(reference.frontmatter),
        })
        if (!actual) errors.push(`${sourcePath}: missing local asset ${reference.target}`)
      } else {
        internalLinks.push({ target: reference.target })
      }
    }
    const assetDetails = []
    for (const name of localAssets) {
      const fullPath = path.join(path.dirname(sourceFile), name)
      const stat = await fs.stat(fullPath)
      assetDetails.push({ name, bytes: stat.size, sha256: await sha256(fullPath) })
    }
    documents.push({
      sourcePath,
      contentType,
      sourceDirectory: path.posix.dirname(sourcePath),
      title: parsed.data.title ?? null,
      gatsbySlug: oldSlug,
      gatsbyHistoricalUrl: `/${oldSlug}/`,
      date: parsed.data.date ?? null,
      tags: parsed.data.tags ?? null,
      description: parsed.data.description ?? null,
      banner: parsed.data.banner ?? null,
      quartzDestination: `${destination}/index.md`,
      quartzCanonicalUrl: canonical,
      requiredAliases,
      localAssets: assetDetails,
      referencedLocalAssets,
      internalLinks,
      externalLinks,
      imports: authoredMdx.imports,
      jsxComponents: authoredMdx.components,
      componentFiles,
      specialTransformations: transformed.transformations,
      warnings: migrationExceptions[sourcePath]
        ? [`Explicit exception: ${migrationExceptions[sourcePath].reason}`]
        : [],
      anchors: headingAnchors(transformedBody),
      output: transformed.output,
    })
  }

  errors.push(...auditRouteCollisions(documents))
  const routeIndex = createRouteIndex(documents)
  for (const document of documents) {
    for (const link of document.internalLinks) {
      Object.assign(link, resolveRouteReference(document, link.target, routeIndex))
      if (link.classification === "missing-target" || link.classification === "missing-fragment") {
        errors.push(
          `${document.sourcePath}: unresolved internal link ${link.target} (${link.classification})`,
        )
      }
    }
  }

  const totals = documents.reduce(
    (summary, document) => {
      summary.assets += document.localAssets.length
      summary.referencedAssets += document.referencedLocalAssets.length
      summary.internalLinks += document.internalLinks.length
      summary.externalLinks += document.externalLinks.length
      for (const [key, value] of Object.entries(document.specialTransformations)) {
        summary.transformations[key] += value
      }
      return summary
    },
    {
      assets: 0,
      referencedAssets: 0,
      internalLinks: 0,
      externalLinks: 0,
      transformations: {
        spotifyRemoval: 0,
        reactLive: 0,
        tables: 0,
        assetCase: 0,
        assetReplacement: 0,
        missingImageRemoval: 0,
        explicitBodyRepair: 0,
        angleBracketProse: 0,
        malformedExternalLink: 0,
        malformedMarkdownLink: 0,
        numericOrdinalEscape: 0,
        currencyDollarEscape: 0,
      },
    },
  )
  const summary = {
    sourceDocuments: documents.length,
    posts: documents.filter((document) => document.contentType === "post").length,
    pages: documents.filter((document) => document.contentType === "page").length,
    historicalUrls: documents.length,
    canonicalMatches: documents.filter((document) => document.requiredAliases.length === 0).length,
    aliasPreserved: documents.filter((document) => document.requiredAliases.length > 0).length,
    localAssets: totals.assets,
    referencedLocalAssets: totals.referencedAssets,
    internalLinks: totals.internalLinks,
    externalLinks: totals.externalLinks,
    transformations: totals.transformations,
    errors: errors.length,
  }
  return { version: 1, sourceRoot, summary, errors, documents }
}

function serializableManifest(manifest) {
  return {
    version: manifest.version,
    sourceRoot: "GatsbyMigration/content-original",
    summary: manifest.summary,
    errors: manifest.errors,
    documents: manifest.documents.map(({ output: _output, ...document }) => document),
  }
}

function assertSafeDestinationRoot(destination) {
  const resolved = path.resolve(destination)
  const parsed = path.parse(resolved)
  if (resolved === parsed.root || resolved.length < parsed.root.length + 4) {
    throw new Error(`Refusing unsafe destination root: ${resolved}`)
  }
}

export async function migrateCorpus({ source, destination, manifestPath }) {
  const manifest = await buildCorpusManifest({ source })
  if (manifest.errors.length) {
    throw new Error(`Migration preflight failed:\n- ${manifest.errors.join("\n- ")}`)
  }
  const destinationRoot = path.resolve(destination)
  assertSafeDestinationRoot(destinationRoot)
  await fs.mkdir(destinationRoot, { recursive: true })

  for (const document of manifest.documents) {
    const destinationDirectory = path.resolve(
      destinationRoot,
      path.dirname(document.quartzDestination),
    )
    const relativeDestination = path.relative(destinationRoot, destinationDirectory)
    if (
      !relativeDestination ||
      relativeDestination.startsWith("..") ||
      path.isAbsolute(relativeDestination)
    ) {
      throw new Error(`Unsafe migration-owned destination: ${destinationDirectory}`)
    }
    await fs.rm(destinationDirectory, { recursive: true, force: true })
    await fs.mkdir(destinationDirectory, { recursive: true })
    await fs.writeFile(path.join(destinationDirectory, "index.md"), document.output, "utf8")
    const sourceDirectory = path.join(path.resolve(source), ...document.sourceDirectory.split("/"))
    for (const asset of document.localAssets) {
      await fs.copyFile(
        path.join(sourceDirectory, asset.name),
        path.join(destinationDirectory, asset.name),
      )
    }
  }

  if (manifestPath) {
    const resolvedManifestPath = path.resolve(manifestPath)
    const prettierOptions = await resolvePrettierConfig(resolvedManifestPath)
    const serializedManifest = await formatWithPrettier(
      JSON.stringify(serializableManifest(manifest)),
      {
        ...prettierOptions,
        filepath: resolvedManifestPath,
      },
    )
    await fs.writeFile(resolvedManifestPath, serializedManifest, "utf8")
  }
  return manifest
}

function parseArguments(argv) {
  const options = {
    source: path.resolve(repositoryRoot, "../GatsbyMigration/content-original"),
    destination: path.resolve(repositoryRoot, "content"),
    manifestPath: path.resolve(repositoryRoot, "scripts/gatsby-migration-manifest.json"),
    check: false,
  }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (["--source", "--destination", "--manifest"].includes(argument)) {
      const value = argv[index + 1]
      if (!value) throw new Error(`${argument} requires a path`)
      const key = argument === "--manifest" ? "manifestPath" : argument.slice(2)
      options[key] = path.resolve(value)
      index += 1
    } else if (argument === "--check" || argument === "--dry-run") options.check = true
    else throw new Error(`Unknown argument: ${argument}`)
  }
  return options
}

async function main() {
  const options = parseArguments(process.argv.slice(2))
  const manifest = options.check
    ? await buildCorpusManifest({ source: options.source })
    : await migrateCorpus(options)
  console.log(JSON.stringify(manifest.summary, null, 2))
  if (manifest.errors.length) {
    console.error(manifest.errors.map((error) => `- ${error}`).join("\n"))
    process.exitCode = 1
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main()
