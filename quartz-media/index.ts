import fs from "node:fs"
import path from "node:path"
import type { Element, Root } from "hast"
import { visit } from "unist-util-visit"
import type { BuildCtx } from "../quartz/util/ctx"
import type { FilePath } from "../quartz/util/path"
import type { QuartzTransformerPluginInstance } from "../quartz/plugins/types"

type MediaDerivative = {
  width: number
  height: number
  cacheRelativePath: string
  publicPath: string
  url: string
}

type MediaSource = {
  sourcePath: string
  outputPath: string
  width: number
  height: number
  hasAlpha: boolean
  derivatives: MediaDerivative[]
}

type MediaManifest = {
  schemaVersion: number
  sources: MediaSource[]
}

type Options = {
  manifestPath?: string
}

type MediaPluginInstance = QuartzTransformerPluginInstance & {
  emit: (ctx: BuildCtx) => AsyncGenerator<FilePath>
  partialEmit: (
    ctx: BuildCtx,
    content: unknown,
    resources: unknown,
    changeEvents: unknown,
  ) => AsyncGenerator<FilePath>
}

function readManifest(manifestPath: string): MediaManifest {
  const absolutePath = path.resolve(process.cwd(), manifestPath)
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Media manifest not found at ${manifestPath}; run npm run media:build`)
  }
  return JSON.parse(fs.readFileSync(absolutePath, "utf8")) as MediaManifest
}

function pagePath(slug: string): string {
  if (slug === "index") return "/"
  if (slug.endsWith("/index")) return `/${slug.slice(0, -"index".length)}`
  return `/${slug}`
}

function outputPathForSource(source: string, slug: string): string | null {
  if (/^(?:https?:|data:|blob:)/i.test(source)) return null
  try {
    const resolved = new URL(source, `https://media.invalid${pagePath(slug)}`)
    return decodeURIComponent(resolved.pathname).replace(/^\/+/, "").toLowerCase()
  } catch {
    return null
  }
}

function addClass(node: Element, className: string) {
  const existing = node.properties.className
  const classes = Array.isArray(existing)
    ? existing.map(String)
    : typeof existing === "string"
      ? existing.split(/\s+/)
      : []
  if (!classes.includes(className)) classes.push(className)
  node.properties.className = classes
}

function mediaTransformer(manifestPath: string) {
  return () => {
    return (tree: Root, file: { data: { slug?: string } }) => {
      const manifest = readManifest(manifestPath)
      const sources = new Map(
        manifest.sources.map((source) => [source.outputPath.toLowerCase(), source]),
      )
      const slug = String(file.data.slug ?? "index")
      let localImageIndex = 0

      visit(tree, "element", (node: Element) => {
        if (node.tagName !== "img" || typeof node.properties.src !== "string") return
        const source = sources.get(outputPathForSource(node.properties.src, slug) ?? "")
        addClass(node, "media-article")
        if (!source) {
          if (/^https?:/i.test(node.properties.src)) {
            addClass(node, "media-external")
            node.properties.loading ??= "lazy"
            node.properties.decoding ??= "async"
          }
          return
        }

        addClass(node, "media-local")
        if (source.hasAlpha) addClass(node, "media-transparent")
        if (source.width < 480 || source.height < 240) addClass(node, "media-small")
        node.properties.width = source.width
        node.properties.height = source.height
        node.properties.decoding ??= "async"
        node.properties.loading ??= localImageIndex === 0 ? "eager" : "lazy"
        localImageIndex += 1

        if (source.derivatives.length > 0) {
          const candidates = source.derivatives
            .map((derivative) => ({ url: derivative.url, width: derivative.width }))
            .concat({ url: node.properties.src, width: source.width })
            .filter(
              (candidate, index, all) =>
                all.findIndex((other) => other.width === candidate.width) === index,
            )
            .sort((left, right) => left.width - right.width)
          node.properties.srcSet = candidates
            .map((candidate) => `${candidate.url} ${candidate.width}w`)
            .join(", ")
          node.properties.sizes = "(max-width: 52rem) calc(100vw - 2rem), 52rem"
          addClass(node, "media-responsive")
        }
      })
    }
  }
}

async function* emitMedia(ctx: BuildCtx, manifestPath: string): AsyncGenerator<FilePath> {
  const manifest = readManifest(manifestPath)
  const derivatives = new Map(
    manifest.sources
      .flatMap((source) => source.derivatives)
      .map((derivative) => [derivative.publicPath, derivative]),
  )
  for (const derivative of derivatives.values()) {
    const source = path.resolve(process.cwd(), derivative.cacheRelativePath)
    const destination = path.resolve(ctx.argv.output, derivative.publicPath) as FilePath
    await fs.promises.mkdir(path.dirname(destination), { recursive: true })
    await fs.promises.copyFile(source, destination)
    yield destination
  }
}

export default function RepositoryMedia(options: Options = {}): MediaPluginInstance {
  const manifestPath = options.manifestPath ?? "generated/media-manifest.json"
  return {
    name: "RepositoryMedia",
    htmlPlugins() {
      return [mediaTransformer(manifestPath)]
    },
    emit(ctx) {
      return emitMedia(ctx, manifestPath)
    },
    partialEmit(ctx) {
      return emitMedia(ctx, manifestPath)
    },
  }
}
