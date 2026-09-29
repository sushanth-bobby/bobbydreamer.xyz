export const mediaConfig = Object.freeze({
  schemaVersion: 1,
  pipelineVersion: "bdv-media-v1",
  contentDirectory: "content",
  inventoryPath: "generated/media-inventory.json",
  manifestPath: "generated/media-manifest.json",
  runReportPath: "generated/media-last-run.json",
  cacheDirectory: "generated/cache/media",
  publicDirectory: "media",
  widths: Object.freeze([480, 832, 1280]),
  minimumSourceWidth: 641,
  minimumSourceBytes: 64 * 1024,
  outputFormat: "webp",
  jpegQuality: 84,
  pngLossless: true,
  imageExtensions: Object.freeze([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]),
  processableExtensions: Object.freeze([".png", ".jpg", ".jpeg"]),
})

export function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(",")}}`
  }
  return JSON.stringify(value)
}
