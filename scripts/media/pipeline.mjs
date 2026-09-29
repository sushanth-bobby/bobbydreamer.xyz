import crypto from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"
import { mediaConfig, stableJson } from "./config.mjs"
import { createInventory, sha256File, toPosix, writeInventory } from "./inventory.mjs"

// Windows otherwise keeps recently inspected derivatives open long enough to make
// an explicit cache clean intermittently fail with EBUSY.
sharp.cache(false)

const digest = (value) => crypto.createHash("sha256").update(value).digest("hex")

export function transformationFor(asset, width, overrides = {}) {
  const extension = asset.extension.toLowerCase()
  const encoder =
    extension === ".png"
      ? { lossless: overrides.pngLossless ?? mediaConfig.pngLossless }
      : { quality: overrides.jpegQuality ?? mediaConfig.jpegQuality, smartSubsample: true }
  return {
    pipelineVersion: overrides.pipelineVersion ?? mediaConfig.pipelineVersion,
    width,
    format: mediaConfig.outputFormat,
    encoder,
  }
}

export function derivativeKey(sourceHash, transformation) {
  return digest(`${sourceHash}\n${stableJson(transformation)}`)
}

export function derivativeName(key, width) {
  return `w${width}-${key.slice(0, 20)}.${mediaConfig.outputFormat}`
}

async function validCachedDerivative(filePath, expectedWidth) {
  try {
    const stats = await fs.stat(filePath)
    if (stats.size === 0) return false
    const metadata = await sharp(filePath).metadata()
    return metadata.format === mediaConfig.outputFormat && metadata.width === expectedWidth
  } catch {
    return false
  }
}

async function generateDerivative(sourcePath, destination, transformation) {
  await fs.mkdir(path.dirname(destination), { recursive: true })
  let operation = sharp(sourcePath).rotate().resize({
    width: transformation.width,
    withoutEnlargement: true,
    fit: "inside",
  })
  operation = operation.webp(transformation.encoder)
  const temporary = `${destination}.${process.pid}.tmp`
  await operation.toFile(temporary)
  await fs.rename(temporary, destination)
}

export async function buildMedia(repositoryRoot, options = {}) {
  const started = performance.now()
  const inventory = await createInventory(repositoryRoot, options)
  if (options.writeInventory !== false) await writeInventory(repositoryRoot, inventory)
  if (inventory.brokenLocalReferences.length > 0 && !options.allowBrokenReferences) {
    throw new Error(
      `Media inventory found ${inventory.brokenLocalReferences.length} broken local reference(s)`,
    )
  }

  const cacheRoot = path.resolve(
    repositoryRoot,
    options.cacheDirectory ?? mediaConfig.cacheDirectory,
  )
  const sources = []
  const stats = { cacheHits: 0, cacheMisses: 0, derivativesGenerated: 0, processedSources: 0 }
  const widths = options.widths ?? mediaConfig.widths

  for (const asset of inventory.assets.filter(
    (candidate) => candidate.referenceCount > 0 && candidate.width && candidate.height,
  )) {
    const sourcePath = path.resolve(repositoryRoot, asset.path)
    const derivatives = []
    let sourceMiss = false
    const derivativeWidths = asset.optimization.eligible
      ? widths.filter((candidate) => candidate < asset.width)
      : []
    for (const width of derivativeWidths) {
      const transformation = transformationFor(asset, width, options)
      const key = derivativeKey(asset.sha256, transformation)
      const fileName = derivativeName(key, width)
      const cacheRelativePath = toPosix(path.join(mediaConfig.cacheDirectory, fileName))
      const destination = path.resolve(repositoryRoot, cacheRelativePath)
      if (await validCachedDerivative(destination, width)) {
        stats.cacheHits += 1
      } else {
        stats.cacheMisses += 1
        stats.derivativesGenerated += 1
        sourceMiss = true
        await generateDerivative(sourcePath, destination, transformation)
      }
      const derivativeMetadata = await sharp(destination).metadata()
      const derivativeStats = await fs.stat(destination)
      derivatives.push({
        key,
        width: derivativeMetadata.width,
        height: derivativeMetadata.height,
        format: derivativeMetadata.format,
        bytes: derivativeStats.size,
        sha256: await sha256File(destination),
        cacheRelativePath,
        publicPath: `${mediaConfig.publicDirectory}/${fileName}`,
        url: `/${mediaConfig.publicDirectory}/${fileName}`,
      })
    }
    if (sourceMiss) stats.processedSources += 1
    sources.push({
      sourcePath: asset.path,
      contentRelativePath: asset.contentRelativePath,
      outputPath: asset.outputPath,
      sourceHash: asset.sha256,
      width: asset.width,
      height: asset.height,
      hasAlpha: asset.hasAlpha,
      bytes: asset.bytes,
      derivatives,
    })
  }

  const configFingerprint = digest(
    stableJson({
      pipelineVersion: options.pipelineVersion ?? mediaConfig.pipelineVersion,
      widths,
      format: mediaConfig.outputFormat,
      jpegQuality: options.jpegQuality ?? mediaConfig.jpegQuality,
      pngLossless: options.pngLossless ?? mediaConfig.pngLossless,
      minimumSourceWidth: mediaConfig.minimumSourceWidth,
      minimumSourceBytes: mediaConfig.minimumSourceBytes,
    }),
  )
  const manifest = {
    schemaVersion: mediaConfig.schemaVersion,
    pipelineVersion: options.pipelineVersion ?? mediaConfig.pipelineVersion,
    configFingerprint,
    sources: sources.sort((left, right) => left.outputPath.localeCompare(right.outputPath, "en")),
  }
  const manifestPath = path.resolve(
    repositoryRoot,
    options.manifestPath ?? mediaConfig.manifestPath,
  )
  await fs.mkdir(path.dirname(manifestPath), { recursive: true })
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

  const derivativeReferences = sources.flatMap((source) => source.derivatives)
  const uniqueDerivatives = [
    ...new Map(
      derivativeReferences.map((derivative) => [derivative.publicPath, derivative]),
    ).values(),
  ]
  const run = {
    schemaVersion: mediaConfig.schemaVersion,
    sourceAssets: inventory.summary.sourceAssets,
    eligibleSources: inventory.summary.optimizationEligible,
    emittedSources: sources.length,
    optimizedSources: sources.filter((source) => source.derivatives.length > 0).length,
    derivativeCount: uniqueDerivatives.length,
    derivativeReferences: derivativeReferences.length,
    generatedBytes: uniqueDerivatives.reduce((total, derivative) => total + derivative.bytes, 0),
    ...stats,
    durationMs: Math.round((performance.now() - started) * 100) / 100,
  }
  const reportPath = path.resolve(
    repositoryRoot,
    options.runReportPath ?? mediaConfig.runReportPath,
  )
  await fs.writeFile(reportPath, `${JSON.stringify(run, null, 2)}\n`)
  return { inventory, manifest, run }
}

export async function verifyMedia(repositoryRoot, options = {}) {
  const expectedInventory = await createInventory(repositoryRoot, options)
  const inventoryPath = path.resolve(repositoryRoot, mediaConfig.inventoryPath)
  const actualInventory = JSON.parse(await fs.readFile(inventoryPath, "utf8"))
  if (stableJson(actualInventory) !== stableJson(expectedInventory)) {
    throw new Error("generated/media-inventory.json is stale; run npm run media:audit")
  }
  const manifestPath = path.resolve(repositoryRoot, mediaConfig.manifestPath)
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"))
  const inventoryByPath = new Map(expectedInventory.assets.map((asset) => [asset.path, asset]))
  for (const source of manifest.sources) {
    const asset = inventoryByPath.get(source.sourcePath)
    if (!asset || asset.sha256 !== source.sourceHash)
      throw new Error(`Stale media source: ${source.sourcePath}`)
    for (const derivative of source.derivatives) {
      const derivativePath = path.resolve(repositoryRoot, derivative.cacheRelativePath)
      if (!(await validCachedDerivative(derivativePath, derivative.width))) {
        throw new Error(`Invalid cached derivative: ${derivative.cacheRelativePath}`)
      }
      if ((await sha256File(derivativePath)) !== derivative.sha256) {
        throw new Error(`Derivative checksum mismatch: ${derivative.cacheRelativePath}`)
      }
    }
  }
  return {
    sources: manifest.sources.length,
    derivatives: new Set(
      manifest.sources.flatMap((source) =>
        source.derivatives.map((derivative) => derivative.publicPath),
      ),
    ).size,
  }
}

export async function cleanMedia(repositoryRoot) {
  await fs.rm(path.resolve(repositoryRoot, mediaConfig.cacheDirectory), {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 100,
  })
  await fs.rm(path.resolve(repositoryRoot, mediaConfig.manifestPath), { force: true })
  await fs.rm(path.resolve(repositoryRoot, mediaConfig.runReportPath), { force: true })
}
