import assert from "node:assert/strict"
import crypto from "node:crypto"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import sharp from "sharp"
import { createInventory, sha256File } from "./inventory.mjs"
import {
  buildMedia,
  cleanMedia,
  derivativeKey,
  derivativeName,
  transformationFor,
} from "./pipeline.mjs"

async function imageFixture(filePath, format, seed) {
  const width = 900
  const height = 600
  const pixels = Buffer.alloc(width * height * 3)
  for (let index = 0; index < pixels.length; index += 1) {
    pixels[index] = crypto
      .createHash("sha256")
      .update(`${seed}:${index >> 8}`)
      .digest()[index % 32]
  }
  let image = sharp(pixels, { raw: { width, height, channels: 3 } })
  image = format === "png" ? image.png({ compressionLevel: 6 }) : image.jpeg({ quality: 92 })
  await image.toFile(filePath)
}

async function fixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "bdv-media-test-"))
  const article = path.join(root, "content", "001-test")
  await fs.mkdir(article, { recursive: true })
  await imageFixture(path.join(article, "screen.png"), "png", "screen-a")
  await imageFixture(path.join(article, "photo.jpg"), "jpeg", "photo-a")
  await fs.copyFile(path.join(article, "photo.jpg"), path.join(article, "photo-copy.jpg"))
  await fs.writeFile(
    path.join(article, "index.md"),
    "---\ntitle: Media fixture\ncover: ./photo.jpg\n---\n\n![Screen](./screen.png)\n\n![Photo](./photo.jpg)\n",
  )
  return { root, article }
}

test("inventory discovers ownership, dimensions, references, and duplicate content", async (t) => {
  const { root } = await fixture()
  t.after(() => fs.rm(root, { recursive: true, force: true }))
  const inventory = await createInventory(root)
  assert.equal(inventory.summary.sourceAssets, 3)
  assert.equal(inventory.summary.imageAssets, 3)
  assert.equal(inventory.summary.brokenLocalReferences, 0)
  assert.equal(inventory.summary.duplicateGroups, 1)
  assert.equal(inventory.assets.find((asset) => asset.path.endsWith("screen.png")).width, 900)
  assert.equal(
    inventory.assets.find((asset) => asset.path.endsWith("screen.png")).owner,
    "content/001-test/index.md",
  )
  assert.equal(
    inventory.assets.find((asset) => asset.path.endsWith("photo-copy.jpg")).apparentlyUnused,
    true,
  )
})

test("content-addressed cache is incremental, scoped, deterministic, and source-safe", async (t) => {
  const { root, article } = await fixture()
  t.after(() => fs.rm(root, { recursive: true, force: true }))
  const sourcePaths = [path.join(article, "screen.png"), path.join(article, "photo.jpg")]
  const before = await Promise.all(sourcePaths.map(sha256File))

  const cold = await buildMedia(root)
  assert.equal(cold.run.processedSources, 2)
  assert.equal(cold.run.cacheMisses, cold.run.derivativeCount)
  assert.ok(cold.run.derivativeCount > 0)
  const coldManifest = JSON.stringify(cold.manifest)

  const warm = await buildMedia(root)
  assert.equal(warm.run.processedSources, 0)
  assert.equal(warm.run.cacheMisses, 0)
  assert.equal(warm.run.cacheHits, warm.run.derivativeReferences)
  assert.equal(JSON.stringify(warm.manifest), coldManifest)
  assert.deepEqual(await Promise.all(sourcePaths.map(sha256File)), before)

  await imageFixture(path.join(article, "screen.png"), "png", "screen-b")
  const changed = await buildMedia(root)
  const screenDerivatives = changed.manifest.sources.find((source) =>
    source.sourcePath.endsWith("screen.png"),
  ).derivatives.length
  assert.equal(changed.run.processedSources, 1)
  assert.equal(changed.run.cacheMisses, screenDerivatives)
  assert.equal(changed.run.cacheHits, changed.run.derivativeCount - screenDerivatives)

  const configured = await buildMedia(root, { jpegQuality: 80 })
  const photoDerivatives = configured.manifest.sources.find((source) =>
    source.sourcePath.endsWith("photo.jpg"),
  ).derivatives.length
  assert.equal(configured.run.cacheMisses, photoDerivatives)
  assert.equal(configured.run.cacheHits, configured.run.derivativeCount - photoDerivatives)

  const after = await Promise.all(sourcePaths.map(sha256File))
  assert.equal(before[1], after[1])
  assert.notEqual(before[0], after[0])

  const stableManifest = JSON.stringify(configured.manifest)
  await cleanMedia(root)
  const rebuilt = await buildMedia(root, { jpegQuality: 80 })
  assert.equal(JSON.stringify(rebuilt.manifest), stableManifest)
})

test("cache keys and filenames change only with relevant inputs", () => {
  const asset = { extension: ".jpg" }
  const first = transformationFor(asset, 480, { jpegQuality: 84 })
  const same = transformationFor(asset, 480, { jpegQuality: 84 })
  const changed = transformationFor(asset, 480, { jpegQuality: 80 })
  const key = derivativeKey("source-hash", first)
  assert.equal(key, derivativeKey("source-hash", same))
  assert.notEqual(key, derivativeKey("source-hash", changed))
  assert.equal(derivativeName(key, 480), derivativeName(key, 480))
})

test("missing local image references fail the build", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "bdv-media-missing-"))
  t.after(() => fs.rm(root, { recursive: true, force: true }))
  await fs.mkdir(path.join(root, "content", "001-test"), { recursive: true })
  await fs.writeFile(
    path.join(root, "content", "001-test", "index.md"),
    "![Missing](./missing.png)\n",
  )
  const inventory = await createInventory(root)
  assert.equal(inventory.summary.brokenLocalReferences, 1)
  await assert.rejects(() => buildMedia(root), /broken local reference/)
})
