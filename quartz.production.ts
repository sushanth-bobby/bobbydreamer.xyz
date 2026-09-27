import { createHash } from "node:crypto"

export const stableContentIndexName = "contentIndex.json"
export const contentIndexHashLength = 16

export function contentIndexAssetName(content: string | Buffer): string {
  const hash = createHash("sha256").update(content).digest("hex").slice(0, contentIndexHashLength)
  return `contentIndex-${hash}.json`
}

export function replaceContentIndexReference(html: string, assetName: string): string {
  return html.replaceAll(stableContentIndexName, assetName)
}

export function canonicalPathForSlug(slug: string): string {
  const normalized = slug.replace(/^\/+|\/+$/g, "").toLowerCase()
  if (normalized === "" || normalized === "index") return "/"
  if (normalized.endsWith("/index")) return `/${normalized.slice(0, -"/index".length)}/`
  return `/${normalized}`
}

export function absoluteSiteUrl(baseUrl: string, slug: string): string {
  const site = new URL(`https://${baseUrl}`)
  const configuredBase = site.pathname.replace(/\/$/, "")
  site.pathname = `${configuredBase}${canonicalPathForSlug(slug)}`
  site.search = ""
  site.hash = ""
  return site.toString()
}

export function productionDescription(slug: string): string | undefined {
  if (slug === "blog/index") {
    return "All bobby_dreamer Blog Articles in numeric publication sequence."
  }

  const year = /^blog\/(\d{4})\/index$/.exec(slug)?.[1]
  if (year) return `bobby_dreamer Blog Articles published in ${year}.`

  if (slug === "topics/index") {
    return "Browse curated topics from bobby_dreamer Blog Articles."
  }

  if (slug === "tags/index") return "Browse all article tags on bobbydreamer.xyz."

  const tag = /^tags\/(.+)$/.exec(slug)?.[1]
  if (tag) return `Browse bobby_dreamer Blog Articles tagged ${tag}.`

  return undefined
}

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

export function escapeCdata(value: string): string {
  return value.replaceAll("]]>", "]]]]><![CDATA[>")
}
