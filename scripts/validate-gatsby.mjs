import crypto from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import {
  buildCorpusManifest,
  normalizeWebPath,
  splitFrontmatter,
  withoutFencedCode,
} from "./migrate-gatsby.mjs"

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.dirname(scriptDirectory)

async function listFiles(directory) {
  const result = []
  async function visit(current) {
    for (const entry of (await fs.readdir(current, { withFileTypes: true })).sort((left, right) =>
      left.name.localeCompare(right.name),
    )) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) await visit(fullPath)
      else result.push(fullPath)
    }
  }
  await visit(directory)
  return result
}

async function exists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function existsWithExactCase(root, candidate) {
  const relative = path.relative(root, candidate)
  if (relative.startsWith("..") || path.isAbsolute(relative)) return false
  let current = root
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    let entries
    try {
      entries = await fs.readdir(current, { withFileTypes: true })
    } catch {
      return false
    }
    const exact = entries.find((entry) => entry.name === segment)
    if (!exact) return false
    current = path.join(current, exact.name)
  }
  return true
}

async function sha256(filePath) {
  return crypto
    .createHash("sha256")
    .update(await fs.readFile(filePath))
    .digest("hex")
}

function publicCandidates(publicRoot, pathname) {
  let decoded
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    decoded = pathname
  }
  const normalized = decoded.replace(/^\/+/, "").replace(/\/$/, "")
  if (!normalized) return [path.join(publicRoot, "index.html")]
  const direct = path.join(publicRoot, ...normalized.split("/"))
  return [direct, `${direct}.html`, path.join(direct, "index.html")]
}

async function firstExactCandidate(publicRoot, pathname) {
  for (const candidate of publicCandidates(publicRoot, pathname)) {
    if (!(await existsWithExactCase(publicRoot, candidate))) continue
    if ((await fs.stat(candidate)).isFile()) return candidate
  }
  return null
}

function htmlReferences(html) {
  const references = []
  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) references.push(match[1])
  for (const match of html.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(","))
      references.push(candidate.trim().split(/\s+/, 1)[0])
  }
  return references
}

function htmlAnchors(html) {
  return new Set([...html.matchAll(/\b(?:id|name)=["']([^"']+)["']/gi)].map((match) => match[1]))
}

async function validateGeneratedReferences(publicRoot, pageUrl, pagePath, anchorCache) {
  const html = await fs.readFile(pagePath, "utf8")
  const failures = []
  let localReferences = 0
  for (const target of htmlReferences(html)) {
    if (/^(?:mailto:|tel:|data:|javascript:|#)/i.test(target) || target === "") continue
    let resolved
    try {
      resolved = new URL(target.replaceAll("&amp;", "&"), `https://migration.invalid${pageUrl}`)
    } catch {
      failures.push(`malformed generated URL ${target}`)
      continue
    }
    if (resolved.hostname !== "migration.invalid") continue
    localReferences += 1
    const candidate = await firstExactCandidate(publicRoot, resolved.pathname)
    if (!candidate) {
      failures.push(`broken generated reference ${target}`)
      continue
    }
    if (resolved.hash && candidate.toLowerCase().endsWith(".html")) {
      let anchors = anchorCache.get(candidate)
      if (!anchors) {
        anchors = htmlAnchors(await fs.readFile(candidate, "utf8"))
        anchorCache.set(candidate, anchors)
      }
      const fragment = decodeURIComponent(resolved.hash.slice(1))
      if (fragment && !anchors.has(fragment)) failures.push(`missing generated fragment ${target}`)
    }
  }
  return { failures, localReferences }
}

function normalizeUrl(value) {
  return `/${normalizeWebPath(value).toLowerCase()}/`
}

export async function validate({ sourceRoot, contentRoot, publicRoot }) {
  const manifest = await buildCorpusManifest({ source: sourceRoot })
  const failures = [...manifest.errors]
  let copiedAssets = 0

  for (const document of manifest.documents) {
    const markdownPath = path.join(contentRoot, ...document.quartzDestination.split("/"))
    if (!(await exists(markdownPath))) {
      failures.push(`${document.sourcePath}: missing migrated index.md`)
      continue
    }
    const markdown = await fs.readFile(markdownPath, "utf8")
    if (markdown !== document.output)
      failures.push(`${document.sourcePath}: migrated Markdown differs from deterministic output`)
    const { data, body } = splitFrontmatter(markdown, document.quartzDestination)
    if (data.slug !== undefined || data.banner !== undefined)
      failures.push(`${document.sourcePath}: Gatsby-only frontmatter remains`)
    const prose = withoutFencedCode(body)
    if (/^\s*(?:import|export)\s/m.test(prose) || /<SpotifyPlayer\b/.test(prose)) {
      failures.push(`${document.sourcePath}: unconverted authored MDX remains`)
    }
    if (/<iframe\b[\s\S]*?\bsrc=["'][^"']*open\.spotify\.com/i.test(prose)) {
      failures.push(`${document.sourcePath}: Spotify iframe remains in migrated Markdown`)
    }

    const destinationDirectory = path.dirname(markdownPath)
    const actualFiles = (await fs.readdir(destinationDirectory, { withFileTypes: true }))
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right))
    const expectedFiles = ["index.md", ...document.localAssets.map((asset) => asset.name)].sort(
      (left, right) => left.localeCompare(right),
    )
    if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) {
      failures.push(
        `${document.sourcePath}: destination file inventory differs from source-owned files`,
      )
    }
    for (const asset of document.localAssets) {
      const outputAsset = path.join(destinationDirectory, asset.name)
      if (!(await existsWithExactCase(destinationDirectory, outputAsset))) {
        failures.push(
          `${document.sourcePath}: missing or case-mismatched copied asset ${asset.name}`,
        )
      } else if ((await sha256(outputAsset)) !== asset.sha256) {
        failures.push(`${document.sourcePath}: copied asset differs from source ${asset.name}`)
      } else copiedAssets += 1
    }
  }

  let generatedLocalReferences = 0
  let generatedCanonicalPages = 0
  let aliasFiles = 0
  let generatedHtmlFiles = 0
  let brandingAssetsValidated = 0
  let generatedNumericTagRoutes = 0
  if (publicRoot) {
    const publicFiles = await listFiles(publicRoot)
    generatedHtmlFiles = publicFiles.filter((file) => file.toLowerCase().endsWith(".html")).length
    for (const htmlPath of publicFiles.filter((file) => file.toLowerCase().endsWith(".html"))) {
      const html = await fs.readFile(htmlPath, "utf8")
      if (/<iframe\b[\s\S]*?\bsrc=["'][^"']*open\.spotify\.com/i.test(html)) {
        failures.push(`${path.relative(publicRoot, htmlPath)}: Spotify iframe remains in output`)
      }
      if (/\/mnt\/data/i.test(html)) {
        failures.push(
          `${path.relative(publicRoot, htmlPath)}: generated HTML references a host path`,
        )
      }
    }

    for (const relativePath of [
      "static/icon.png",
      "static/brand/bobbydreamer-mark.png",
      "favicon.ico",
    ]) {
      const assetPath = path.join(publicRoot, ...relativePath.split("/"))
      if (!(await existsWithExactCase(publicRoot, assetPath))) {
        failures.push(`missing generated branding asset /${relativePath}`)
      } else brandingAssetsValidated += 1
    }

    for (const route of ["/tags/1/", "/tags/2/", "/tags/3/", "/tags/4/", "/tags/5/"]) {
      if (await firstExactCandidate(publicRoot, route)) {
        generatedNumericTagRoutes += 1
        failures.push(`obsolete numeric tag route remains ${route}`)
      }
    }

    for (const pageUrl of ["/", "/blog/2023/", "/tags/notes"]) {
      const pagePath = await firstExactCandidate(publicRoot, pageUrl)
      if (!pagePath) {
        failures.push(`missing branding validation page ${pageUrl}`)
        continue
      }
      const html = await fs.readFile(pagePath, "utf8")
      if (!/static\/brand\/bobbydreamer-mark\.png/.test(html))
        failures.push(`${pageUrl}: site identity does not reference the brand mark`)
      if (!/rel="icon"[^>]+static\/icon\.png/.test(html))
        failures.push(`${pageUrl}: generated HTML does not reference the favicon source`)
    }
    const anchorCache = new Map()
    for (const document of manifest.documents) {
      const pagePath = path.join(
        publicRoot,
        ...normalizeWebPath(document.quartzCanonicalUrl).split("/"),
        "index.html",
      )
      if (!(await existsWithExactCase(publicRoot, pagePath))) {
        failures.push(
          `${document.sourcePath}: missing generated canonical page ${document.quartzCanonicalUrl}`,
        )
        continue
      }
      generatedCanonicalPages += 1
      const generated = await validateGeneratedReferences(
        publicRoot,
        document.quartzCanonicalUrl,
        pagePath,
        anchorCache,
      )
      generatedLocalReferences += generated.localReferences
      for (const failure of generated.failures) failures.push(`${document.sourcePath}: ${failure}`)

      for (const alias of document.requiredAliases) {
        const aliasPath = path.join(publicRoot, `${normalizeWebPath(alias)}.html`)
        if (!(await existsWithExactCase(publicRoot, aliasPath))) {
          failures.push(`${document.sourcePath}: missing alias file ${alias}`)
          continue
        }
        aliasFiles += 1
        const aliasHtml = await fs.readFile(aliasPath, "utf8")
        const target = aliasHtml.match(
          /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i,
        )?.[1]
        if (!target) {
          failures.push(`${document.sourcePath}: alias ${alias} lacks a canonical target`)
          continue
        }
        const resolved = new URL(
          target,
          `https://migration.invalid/${normalizeWebPath(alias)}.html`,
        )
        if (normalizeUrl(resolved.pathname) !== normalizeUrl(document.quartzCanonicalUrl)) {
          failures.push(`${document.sourcePath}: alias ${alias} redirects to ${resolved.pathname}`)
        }
      }
    }
  }

  const internalLinks = manifest.documents.flatMap((document) => document.internalLinks)
  const brokenLinks = internalLinks.filter((link) =>
    ["missing-target", "missing-fragment"].includes(link.classification),
  ).length
  const summary = {
    sourceDocuments: manifest.summary.sourceDocuments,
    posts: manifest.summary.posts,
    pages: manifest.summary.pages,
    migratedDocuments: manifest.documents.length,
    skippedDocuments: 0,
    unexpectedMigrationFailures: manifest.errors.length,
    historicalUrls: manifest.summary.historicalUrls,
    canonicalMatches: manifest.summary.canonicalMatches,
    aliasPreserved: manifest.summary.aliasPreserved,
    unaccountedUrls: 0,
    routeCollisions: 0,
    localAssets: manifest.summary.localAssets,
    referencedLocalAssets: manifest.summary.referencedLocalAssets,
    copiedAssets,
    missingLocalAssets: manifest.documents
      .flatMap((document) => document.referencedLocalAssets)
      .filter((asset) => asset.classification === "missing").length,
    caseCorrections: manifest.summary.transformations.assetCase,
    internalLinks: internalLinks.length,
    resolvedLinks: internalLinks.filter((link) =>
      ["canonical", "fragment", "generated"].includes(link.classification),
    ).length,
    aliasResolvedLinks: internalLinks.filter((link) => link.classification === "alias").length,
    brokenLinks,
    deferredLinks: 0,
    transformations: manifest.summary.transformations,
    knownImportedComponentPatterns: manifest.documents.reduce(
      (count, document) => count + document.imports.length + document.jsxComponents.length,
      0,
    ),
    unknownAuthoredMdxPatterns: 0,
    generatedCanonicalPages,
    generatedHtmlFiles,
    aliasFiles,
    generatedLocalReferences,
    brandingAssetsValidated,
    generatedNumericTagRoutes,
    unexpectedBrokenGeneratedReferences: failures.filter((failure) =>
      /generated reference|generated fragment/.test(failure),
    ).length,
    failures: failures.length,
  }

  if (failures.length)
    throw new Error(`Full migration validation failed:\n- ${failures.join("\n- ")}`)
  return summary
}

function parseArguments(argv) {
  const options = {
    sourceRoot: path.resolve(repositoryRoot, "../GatsbyMigration/content-original"),
    contentRoot: path.resolve(repositoryRoot, "content"),
    publicRoot: undefined,
  }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (["--source", "--content", "--public"].includes(argument)) {
      const value = argv[index + 1]
      if (!value) throw new Error(`${argument} requires a path`)
      const key =
        argument === "--source"
          ? "sourceRoot"
          : argument === "--content"
            ? "contentRoot"
            : "publicRoot"
      options[key] = path.resolve(value)
      index += 1
    } else throw new Error(`Unknown argument: ${argument}`)
  }
  return options
}

async function main() {
  const result = await validate(parseArguments(process.argv.slice(2)))
  console.log(JSON.stringify(result, null, 2))
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main()
