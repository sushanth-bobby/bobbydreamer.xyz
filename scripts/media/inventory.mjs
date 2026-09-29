import crypto from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"
import { unified } from "unified"
import remarkParse from "remark-parse"
import { visit } from "unist-util-visit"
import { mediaConfig } from "./config.mjs"

const mimeByExtension = new Map([
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"],
])

export const toPosix = (value) => value.replaceAll(path.sep, "/")

export function slugifyAssetPath(value) {
  return toPosix(value)
    .split("/")
    .map((segment) =>
      segment
        .replace(/\s/g, "-")
        .replace(/&/g, "-and-")
        .replace(/%/g, "-percent")
        .replace(/[?#<>:\"|*]/g, "")
        .toLowerCase(),
    )
    .join("/")
}

export async function listFiles(root) {
  const output = []
  async function visit(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    entries.sort((left, right) => left.name.localeCompare(right.name, "en"))
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name)
      if (entry.isDirectory()) await visit(fullPath)
      else if (entry.isFile()) output.push(fullPath)
    }
  }
  await visit(root)
  return output
}

export async function sha256File(filePath) {
  return crypto
    .createHash("sha256")
    .update(await fs.readFile(filePath))
    .digest("hex")
}

function frontmatterBlock(markdown) {
  return markdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\s*\r?\n|$)/)?.[1] ?? ""
}

function referenceCandidates(markdown) {
  const references = []
  const tree = unified().use(remarkParse).parse(markdown)
  const definitions = new Map()
  visit(tree, "definition", (node) =>
    definitions.set(String(node.identifier).toLowerCase(), node.url),
  )
  visit(tree, (node) => {
    if (node.type === "image") {
      references.push({
        target: node.url,
        kind: "markdown-image",
        alt: node.alt ?? "",
        altState: node.alt ? "meaningful" : "empty",
      })
    } else if (node.type === "imageReference") {
      const target = definitions.get(String(node.identifier).toLowerCase())
      if (target) {
        references.push({
          target,
          kind: "markdown-image",
          alt: node.alt ?? "",
          altState: node.alt ? "meaningful" : "empty",
        })
      }
    } else if (node.type === "link" && /\.(?:png|jpe?g|webp|gif|svg)(?:[?#].*)?$/i.test(node.url)) {
      references.push({ target: node.url, kind: "markdown-link" })
    } else if (node.type === "html") {
      for (const match of node.value.matchAll(/<img\b([^>]*?)>/gi)) {
        const attributes = match[1]
        const source = /\bsrc\s*=\s*(["'])(.*?)\1/i.exec(attributes)?.[2]
        if (!source) continue
        const altMatch = /\balt\s*=\s*(["'])(.*?)\1/i.exec(attributes)
        references.push({
          target: source,
          kind: "html-image",
          alt: altMatch?.[2],
          altState: altMatch ? (altMatch[2] ? "meaningful" : "empty") : "missing",
        })
      }
    }
  })

  const frontmatter = frontmatterBlock(markdown)
  const frontmatterAsset =
    /^\s*(?:image|banner|cover|thumbnail|logo|gatsbyBanner)\s*:\s*["']?([^"'\s]+)["']?\s*$/gim
  for (const match of frontmatter.matchAll(frontmatterAsset)) {
    references.push({ target: match[1], kind: "frontmatter" })
  }
  return references
}

function externalTarget(target) {
  return /^(?:https?:)?\/\//i.test(target) || /^data:/i.test(target)
}

function cleanTarget(target) {
  const unwrapped = target.trim().replace(/^<|>$/g, "")
  return unwrapped.split(/[?#]/, 1)[0]
}

function resolveContentTarget(contentRoot, markdownPath, target) {
  const cleaned = cleanTarget(target)
  if (!cleaned || cleaned.startsWith("#") || externalTarget(cleaned)) return null
  let decoded
  try {
    decoded = decodeURIComponent(cleaned)
  } catch {
    decoded = cleaned
  }
  return path.resolve(
    decoded.startsWith("/") ? contentRoot : path.dirname(markdownPath),
    decoded.replace(/^[/\\]+/, ""),
  )
}

function optimizationDecision({
  extension,
  bytes,
  width,
  animated,
  referenceCount,
  renderReferenceCount,
}) {
  if (!mediaConfig.processableExtensions.includes(extension))
    return { eligible: false, reason: "bypass-format" }
  if (animated) return { eligible: false, reason: "animated" }
  if (referenceCount === 0) return { eligible: false, reason: "unreferenced" }
  if (renderReferenceCount === 0) return { eligible: false, reason: "non-rendered-reference" }
  if (!width) return { eligible: false, reason: "unknown-dimensions" }
  if (width < mediaConfig.minimumSourceWidth) return { eligible: false, reason: "small-dimensions" }
  if (bytes < mediaConfig.minimumSourceBytes) return { eligible: false, reason: "small-file" }
  return { eligible: true, reason: "responsive-raster" }
}

async function nearestOwner(contentRoot, assetPath) {
  let directory = path.dirname(assetPath)
  while (directory.startsWith(contentRoot)) {
    const candidate = path.join(directory, "index.md")
    try {
      await fs.access(candidate)
      return toPosix(path.relative(path.dirname(contentRoot), candidate))
    } catch {
      if (directory === contentRoot) break
      directory = path.dirname(directory)
    }
  }
  return null
}

export async function createInventory(repositoryRoot, options = {}) {
  const contentRoot = path.resolve(
    repositoryRoot,
    options.contentDirectory ?? mediaConfig.contentDirectory,
  )
  const allContentFiles = await listFiles(contentRoot)
  const markdownFiles = allContentFiles.filter((file) => path.extname(file).toLowerCase() === ".md")
  const sourceFiles = allContentFiles.filter((file) => path.extname(file).toLowerCase() !== ".md")
  const referencesByPath = new Map()
  const brokenLocalReferences = []
  const externalImageReferences = []
  const altText = { meaningful: 0, empty: 0, missing: 0 }

  for (const markdownPath of markdownFiles) {
    const markdown = await fs.readFile(markdownPath, "utf8")
    for (const reference of referenceCandidates(markdown)) {
      if (reference.altState) altText[reference.altState] += 1
      if (externalTarget(reference.target)) {
        if (reference.kind.includes("image")) {
          externalImageReferences.push({
            document: toPosix(path.relative(repositoryRoot, markdownPath)),
            target: reference.target,
            kind: reference.kind,
          })
        }
        continue
      }
      const resolved = resolveContentTarget(contentRoot, markdownPath, reference.target)
      if (!resolved) continue
      const key = path.normalize(resolved).toLowerCase()
      const record = {
        document: toPosix(path.relative(repositoryRoot, markdownPath)),
        kind: reference.kind,
        target: reference.target,
      }
      const existing = referencesByPath.get(key) ?? []
      existing.push(record)
      referencesByPath.set(key, existing)
    }
  }

  const sourceSet = new Set(sourceFiles.map((file) => path.normalize(file).toLowerCase()))
  for (const [resolved, references] of referencesByPath) {
    if (!sourceSet.has(resolved))
      brokenLocalReferences.push(...references.map((reference) => ({ ...reference, resolved })))
  }

  const assets = []
  for (const filePath of sourceFiles) {
    const extension = path.extname(filePath).toLowerCase()
    const stats = await fs.stat(filePath)
    const image = mimeByExtension.has(extension)
    let metadata = {}
    let metadataError
    if (image) {
      try {
        metadata = await sharp(filePath, { animated: true }).metadata()
      } catch (error) {
        metadataError = error instanceof Error ? error.message : String(error)
      }
    }
    const references = referencesByPath.get(path.normalize(filePath).toLowerCase()) ?? []
    const width = metadata.width ?? null
    const height = metadata.height ?? null
    const pages = metadata.pages ?? 1
    const animated = pages > 1
    const relativePath = toPosix(path.relative(repositoryRoot, filePath))
    const contentRelativePath = toPosix(path.relative(contentRoot, filePath))
    const asset = {
      path: relativePath,
      contentRelativePath,
      outputPath: slugifyAssetPath(contentRelativePath),
      owner: await nearestOwner(contentRoot, filePath),
      extension,
      mime: mimeByExtension.get(extension) ?? null,
      bytes: stats.size,
      sha256: await sha256File(filePath),
      width,
      height,
      aspectRatio: width && height ? Number((width / height).toFixed(6)) : null,
      hasAlpha: metadata.hasAlpha ?? null,
      pages,
      animated,
      metadataError: metadataError ?? null,
      referenceCount: references.length,
      renderReferenceCount: references.filter((reference) =>
        ["markdown-image", "html-image"].includes(reference.kind),
      ).length,
      referenceKinds: [...new Set(references.map((reference) => reference.kind))].sort(),
      referencedBy: references.sort((left, right) =>
        `${left.document}:${left.target}`.localeCompare(`${right.document}:${right.target}`, "en"),
      ),
      apparentlyUnused: references.length === 0,
      supported: mediaConfig.processableExtensions.includes(extension),
    }
    asset.optimization = optimizationDecision(asset)
    assets.push(asset)
  }

  assets.sort((left, right) => left.path.localeCompare(right.path, "en"))
  const byExtension = {}
  for (const asset of assets) {
    byExtension[asset.extension] ??= { count: 0, bytes: 0 }
    byExtension[asset.extension].count += 1
    byExtension[asset.extension].bytes += asset.bytes
  }
  const hashGroups = new Map()
  for (const asset of assets) {
    const group = hashGroups.get(asset.sha256) ?? []
    group.push(asset.path)
    hashGroups.set(asset.sha256, group)
  }
  const duplicateGroups = [...hashGroups.entries()]
    .filter(([, files]) => files.length > 1)
    .map(([sha256, files]) => ({ sha256, files: files.sort() }))
    .sort((left, right) => left.files[0].localeCompare(right.files[0], "en"))

  return {
    schemaVersion: mediaConfig.schemaVersion,
    summary: {
      sourceAssets: assets.length,
      imageAssets: assets.filter((asset) => asset.mime?.startsWith("image/")).length,
      nonImageAssets: assets.filter((asset) => !asset.mime?.startsWith("image/")).length,
      totalBytes: assets.reduce((total, asset) => total + asset.bytes, 0),
      referencedAssets: assets.filter((asset) => asset.referenceCount > 0).length,
      unreferencedAssets: assets.filter((asset) => asset.referenceCount === 0).length,
      optimizationEligible: assets.filter((asset) => asset.optimization.eligible).length,
      brokenLocalReferences: brokenLocalReferences.length,
      externalImageReferences: externalImageReferences.length,
      duplicateGroups: duplicateGroups.length,
      byExtension,
      altText,
    },
    duplicateGroups,
    brokenLocalReferences: brokenLocalReferences.sort((left, right) =>
      `${left.document}:${left.target}`.localeCompare(`${right.document}:${right.target}`, "en"),
    ),
    externalImageReferences: externalImageReferences.sort((left, right) =>
      `${left.document}:${left.target}`.localeCompare(`${right.document}:${right.target}`, "en"),
    ),
    assets,
  }
}

export async function writeInventory(repositoryRoot, inventory) {
  const destination = path.resolve(repositoryRoot, mediaConfig.inventoryPath)
  await fs.mkdir(path.dirname(destination), { recursive: true })
  await fs.writeFile(destination, `${JSON.stringify(inventory, null, 2)}\n`)
  return destination
}
