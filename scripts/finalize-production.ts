import fs from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { parse as parseYaml } from "yaml"
import {
  absoluteSiteUrl,
  contentIndexAssetName,
  productionDescription,
  replaceContentIndexReference,
  stableContentIndexName,
} from "../quartz.production"

const repositoryRoot = path.resolve(import.meta.dirname, "..")
const publicRoot = path.join(repositoryRoot, "public")
const quartzConfig = parseYaml(
  await fs.readFile(path.join(repositoryRoot, "quartz.config.yaml"), "utf8"),
)
const baseUrl = quartzConfig?.configuration?.baseUrl
if (typeof baseUrl !== "string" || baseUrl.length === 0) {
  throw new Error("Production metadata finalization requires configuration.baseUrl")
}

async function htmlFiles(directory: string): Promise<string[]> {
  const files: string[] = []
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await htmlFiles(filePath)))
    else if (entry.name.endsWith(".html")) files.push(filePath)
  }
  return files
}

export async function finalizeContentIndex(root: string): Promise<string> {
  const staticRoot = path.join(root, "static")
  const stablePath = path.join(staticRoot, stableContentIndexName)
  const content = await fs.readFile(stablePath)
  const assetName = contentIndexAssetName(content)
  const assetPath = path.join(staticRoot, assetName)

  await fs.writeFile(assetPath, content)
  await fs.rm(stablePath)

  for (const filePath of await htmlFiles(root)) {
    const source = await fs.readFile(filePath, "utf8")
    const output = replaceContentIndexReference(source, assetName)
    if (output !== source) await fs.writeFile(filePath, output)
  }

  return assetName
}

function slugForOutput(filePath: string): string {
  const relative = path.relative(publicRoot, filePath).replaceAll(path.sep, "/")
  if (relative === "index.html") return "index"
  if (relative.endsWith("/index.html")) return relative.slice(0, -".html".length)
  return relative.slice(0, -".html".length)
}

function setMetaContent(html: string, attribute: string, value: string): string {
  const pattern = new RegExp(`(<meta ${attribute} content=")[^"]*("\\s*\\/?>)`, "g")
  return html.replace(pattern, `$1${value}$2`)
}

export function finalizeHtml(html: string, slug: string): string {
  // Alias and Quartz 4 compatibility pages own their canonical redirect target.
  if (/<meta http-equiv="refresh"/i.test(html)) return html

  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/g, "")
  html = html.replace(/<meta name="robots" content="noindex"\s*\/?>/g, "")

  if (slug === "404") {
    return html.replace("</head>", '<meta name="robots" content="noindex"/></head>')
  }

  const canonical = absoluteSiteUrl(baseUrl, slug)
  html = setMetaContent(html, 'property="og:url"', canonical)
  html = setMetaContent(html, 'property="twitter:url"', canonical)

  const description = productionDescription(slug)
  if (description) {
    html = setMetaContent(html, 'name="description"', description)
    html = setMetaContent(html, 'name="twitter:description"', description)
    html = setMetaContent(html, 'property="og:description"', description)
    html = setMetaContent(html, 'property="og:image:alt"', description)
  }

  return html.replace("</head>", `<link rel="canonical" href="${canonical}"/></head>`)
}

async function main() {
  const contentIndex = await finalizeContentIndex(publicRoot)
  let changed = 0
  for (const filePath of await htmlFiles(publicRoot)) {
    const source = await fs.readFile(filePath, "utf8")
    const output = finalizeHtml(source, slugForOutput(filePath))
    if (output !== source) {
      await fs.writeFile(filePath, output)
      changed += 1
    }
  }
  console.log(`Published cache-safe content index: static/${contentIndex}`)
  console.log(`Finalized production metadata in ${changed} HTML files`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main()
