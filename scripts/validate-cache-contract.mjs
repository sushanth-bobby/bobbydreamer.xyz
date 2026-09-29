import { createHash } from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"

const repositoryRoot = path.resolve(import.meta.dirname, "..")
const publicRoot = path.join(repositoryRoot, "public")
const staticRoot = path.join(publicRoot, "static")
const failures = []

async function listFiles(directory) {
  const files = []
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await listFiles(filePath)))
    else files.push(filePath)
  }
  return files
}

const allFiles = await listFiles(publicRoot)
const htmlFiles = allFiles.filter((file) => file.endsWith(".html"))
const staticNames = await fs.readdir(staticRoot)
const contentIndexes = staticNames.filter((name) => /^contentIndex-[0-9a-f]{16}\.json$/.test(name))

if (contentIndexes.length !== 1) {
  failures.push(`expected one content-addressed content index, found ${contentIndexes.length}`)
}
if (staticNames.includes("contentIndex.json")) {
  failures.push("stable /static/contentIndex.json remains published")
}

let indexHash
if (contentIndexes[0]) {
  const indexContent = await fs.readFile(path.join(staticRoot, contentIndexes[0]))
  indexHash = createHash("sha256").update(indexContent).digest("hex").slice(0, 16)
  if (contentIndexes[0] !== `contentIndex-${indexHash}.json`) {
    failures.push("content index filename does not match its SHA-256 content identity")
  }
}

let pagesWithIndex = 0
const referencedIndexes = new Set()
for (const htmlPath of htmlFiles) {
  const html = await fs.readFile(htmlPath, "utf8")
  if (html.includes("contentIndex.json")) {
    failures.push(`${path.relative(publicRoot, htmlPath)} references the unsafe stable index`)
  }
  const references = [...html.matchAll(/contentIndex-[0-9a-f]{16}\.json/g)].map((match) => match[0])
  if (references.length > 0) pagesWithIndex += 1
  for (const reference of references) referencedIndexes.add(reference)
}
if (pagesWithIndex === 0) failures.push("no generated page references the content index")
if (referencedIndexes.size !== 1 || !referencedIndexes.has(contentIndexes[0])) {
  failures.push("generated pages do not share the current content-addressed index")
}

const caddy = await fs.readFile(path.join(repositoryRoot, "Caddyfile"), "utf8")
if (!/header @mutableAsset Cache-Control "no-cache"/.test(caddy)) {
  failures.push("Caddy does not require revalidation for stable URLs")
}
if (!/max-age=31536000, immutable/.test(caddy)) {
  failures.push("Caddy does not mark content-hashed resources immutable")
}
if (!/-\[0-9a-f\]\{8,64\}/.test(caddy)) {
  failures.push("Caddy immutable matcher does not cover Quartz content hashes")
}

const immutable = allFiles.filter((file) =>
  /-[0-9a-f]{8,64}\.(?:css|js|json|webp|avif)$/.test(file),
)
const revalidated = allFiles.filter((file) => !immutable.includes(file))

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`)
  process.exitCode = 1
} else {
  console.log("Cache contract validation passed:")
  console.log(`- content index: static/${contentIndexes[0]} (SHA-256 ${indexHash})`)
  console.log(`- ${pagesWithIndex} generated pages reference the release-compatible index`)
  console.log(`- ${immutable.length} content-hashed resources classified immutable`)
  console.log(`- ${revalidated.length} stable resources classified mutable + revalidated`)
}
