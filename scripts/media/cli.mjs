#!/usr/bin/env node
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createInventory, writeInventory } from "./inventory.mjs"
import { buildMedia, cleanMedia, verifyMedia } from "./pipeline.mjs"

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const command = process.argv[2] ?? "build"

if (command === "audit") {
  const inventory = await createInventory(repositoryRoot)
  const destination = await writeInventory(repositoryRoot, inventory)
  console.log(
    `Media inventory: ${inventory.summary.sourceAssets} assets, ${inventory.summary.totalBytes} bytes`,
  )
  console.log(`Wrote ${path.relative(repositoryRoot, destination)}`)
} else if (command === "build") {
  const { run } = await buildMedia(repositoryRoot)
  console.log(
    `Media build: ${run.derivativeCount} derivatives; ${run.cacheHits} hits, ${run.cacheMisses} misses; ${run.durationMs}ms`,
  )
} else if (command === "verify") {
  const result = await verifyMedia(repositoryRoot)
  console.log(
    `Media verification: ${result.sources} sources and ${result.derivatives} derivatives are valid.`,
  )
} else if (command === "clean") {
  await cleanMedia(repositoryRoot)
  console.log(
    "Removed disposable media derivatives and run metadata; source assets and inventory were preserved.",
  )
} else if (command === "stats") {
  const stats = JSON.parse(
    await fs.readFile(path.join(repositoryRoot, "generated/media-last-run.json"), "utf8"),
  )
  console.log(JSON.stringify(stats, null, 2))
} else {
  throw new Error(`Unknown media command: ${command}`)
}
