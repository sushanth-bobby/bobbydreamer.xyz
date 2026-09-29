import fs from "node:fs/promises"
import path from "node:path"

const repositoryRoot = path.resolve(import.meta.dirname, "..")
const publicRoot = path.join(repositoryRoot, "public")
const manifest = JSON.parse(
  await fs.readFile(path.join(repositoryRoot, "generated", "media-manifest.json"), "utf8"),
)
const failures = []
let articleImages = 0
let localImages = 0
let externalImages = 0
let responsiveImages = 0
let lazyImages = 0
let eagerImages = 0

async function files(directory) {
  const output = []
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) output.push(...(await files(fullPath)))
    else output.push(fullPath)
  }
  return output
}

function attributes(tag) {
  return [
    ...tag.matchAll(/\s([A-Za-z_:][-A-Za-z0-9_:.]*)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g),
  ].map((match) => [match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? ""])
}

function publicPathFor(url, htmlPath) {
  const clean = url.split(/[?#]/, 1)[0]
  if (/^(?:https?:|data:|blob:)/i.test(clean)) return null
  return clean.startsWith("/")
    ? path.join(publicRoot, ...clean.replace(/^\/+/, "").split("/"))
    : path.resolve(path.dirname(htmlPath), clean)
}

for (const htmlPath of (await files(publicRoot)).filter((file) => file.endsWith(".html"))) {
  const html = await fs.readFile(htmlPath, "utf8")
  const article = /<article\b[^>]*>([\s\S]*?)<\/article>/.exec(html)?.[1]
  if (!article) continue
  let pageLocalIndex = 0
  for (const match of article.matchAll(/<img\b[^>]*>/gi)) {
    articleImages += 1
    const tag = match[0]
    const pairs = attributes(tag)
    const names = pairs.map(([name]) => name)
    const values = Object.fromEntries(pairs)
    const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index)
    if (duplicateNames.length > 0)
      failures.push(
        `${path.relative(publicRoot, htmlPath)} has duplicate image attributes: ${duplicateNames.join(", ")}`,
      )
    const classes = (values.class ?? "").split(/\s+/)
    if (!classes.includes("media-article"))
      failures.push(
        `${path.relative(publicRoot, htmlPath)} contains an unclassified article image: ${tag}`,
      )

    if (classes.includes("media-local")) {
      localImages += 1
      if (!values.width || !values.height)
        failures.push(
          `${path.relative(publicRoot, htmlPath)} local image lacks intrinsic dimensions: ${tag}`,
        )
      if (values.decoding !== "async")
        failures.push(
          `${path.relative(publicRoot, htmlPath)} local image lacks async decoding: ${tag}`,
        )
      const expectedLoading = pageLocalIndex === 0 ? "eager" : "lazy"
      if (values.loading !== expectedLoading)
        failures.push(
          `${path.relative(publicRoot, htmlPath)} expected ${expectedLoading} loading: ${tag}`,
        )
      pageLocalIndex += 1
      if (values.loading === "eager") eagerImages += 1
      if (values.loading === "lazy") lazyImages += 1
      const sourcePath = publicPathFor(values.src, htmlPath)
      if (!sourcePath || !(await fs.stat(sourcePath).catch(() => null)))
        failures.push(
          `${path.relative(publicRoot, htmlPath)} has missing image source ${values.src}`,
        )
    }

    if (classes.includes("media-external")) externalImages += 1
    if (classes.includes("media-responsive")) {
      responsiveImages += 1
      if (!values.srcset || !values.sizes)
        failures.push(
          `${path.relative(publicRoot, htmlPath)} responsive image lacks srcset or sizes: ${tag}`,
        )
      for (const candidate of (values.srcset ?? "").split(",")) {
        const [url, descriptor] = candidate.trim().split(/\s+/)
        if (!/^\d+w$/.test(descriptor ?? ""))
          failures.push(
            `${path.relative(publicRoot, htmlPath)} has invalid srcset candidate ${candidate}`,
          )
        const candidatePath = publicPathFor(url, htmlPath)
        if (candidatePath && !(await fs.stat(candidatePath).catch(() => null)))
          failures.push(
            `${path.relative(publicRoot, htmlPath)} has missing srcset candidate ${url}`,
          )
      }
    }
  }
}

const derivativePaths = new Set(
  manifest.sources.flatMap((source) =>
    source.derivatives.map((derivative) => derivative.publicPath),
  ),
)
for (const derivativePath of derivativePaths) {
  if (!(await fs.stat(path.join(publicRoot, derivativePath)).catch(() => null))) {
    failures.push(`Manifest derivative is not emitted: ${derivativePath}`)
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`)
  process.exitCode = 1
} else {
  console.log("Media output validation passed:")
  console.log(
    `- ${articleImages} article image occurrences (${localImages} local, ${externalImages} external)`,
  )
  console.log(
    `- ${responsiveImages} responsive image occurrences; ${derivativePaths.size} unique derivatives`,
  )
  console.log(
    `- loading policy: ${eagerImages} eager first images, ${lazyImages} lazy subsequent images`,
  )
  console.log(
    "- intrinsic dimensions, srcset/sizes, decoding, paths, and duplicate attributes are valid",
  )
}
