import assert from "node:assert/strict"
import crypto from "node:crypto"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import {
  auditRouteCollisions,
  buildCorpusManifest,
  escapeCurrencyDollars,
  escapeNumericOrdinalTags,
  migrateCorpus,
  normalizeLocalAssetCasing,
  normalizeReactLiveMetadata,
  normalizeTableSeparators,
  splitFrontmatter,
  transformDocument,
  removeSpotifyComponents,
  withoutFencedCode,
} from "./migrate-gatsby.mjs"

const sourceRoot = path.resolve(import.meta.dirname, "../../GatsbyMigration/content-original")
const corpusManifestPromise = buildCorpusManifest({ source: sourceRoot })

test("full corpus preflight accounts for every post, page, route, and asset", async () => {
  const manifest = await corpusManifestPromise
  assert.equal(manifest.errors.length, 0)
  assert.equal(manifest.summary.sourceDocuments, 153)
  assert.equal(manifest.summary.posts, 149)
  assert.equal(manifest.summary.pages, 4)
  assert.equal(manifest.summary.canonicalMatches + manifest.summary.aliasPreserved, 153)
  assert.equal(manifest.summary.localAssets, 491)
})

test("standard, page, numbered, and dotted destinations are represented", async () => {
  const manifest = await corpusManifestPromise
  const bySource = new Map(manifest.documents.map((document) => [document.sourcePath, document]))
  assert.equal(bySource.get("posts/01-hello-world/index.mdx").contentType, "post")
  assert.equal(bySource.get("pages/bio/index.mdx").contentType, "page")
  assert.equal(
    bySource.get("posts/121-backup-to-gcs/index.mdx").quartzDestination,
    "121-backup-to-gcs/index.md",
  )
  assert.equal(
    bySource.get("posts/19.changing-gatsby-colors-manually/index.mdx").quartzDestination,
    "19.changing-gatsby-colors-manually/index.md",
  )
})

test("frontmatter preserves content metadata and maps only differing slugs to aliases", () => {
  const input = `---
title: Example
date: 2020-01-02
description: Test post
tags: [one, two]
banner: ./cover.png
slug: /example
---

Hello.
`
  const { output } = transformDocument(
    input,
    { source: "posts/01-example/index.mdx", destination: "01-example" },
    ["cover.png"],
  )
  const { data, body } = splitFrontmatter(output)
  assert.equal(data.title, "Example")
  assert.equal(data.date, "2020-01-02")
  assert.deepEqual(data.tags, ["one", "two"])
  assert.equal(data.gatsbyBanner, "./cover.png")
  assert.deepEqual(data.aliases, ["example"])
  assert.equal(data.slug, undefined)
  assert.match(body, /Hello\./)

  const canonical = transformDocument(
    input.replace("slug: /example", "slug: /01-example"),
    { source: "posts/01-example/index.mdx", destination: "01-example" },
    ["cover.png"],
  )
  assert.equal(splitFrontmatter(canonical.output).data.aliases, undefined)
})

test("Spotify components are removed while fenced historical examples remain unchanged", () => {
  const input = `import SpotifyPlayer from "./SpotifyPlayer";

<SpotifyPlayer uri="spotify:user:person:playlist:abc123" size="large" />

\`\`\`jsx
<SpotifyPlayer uri="spotify:user:person:playlist:example-only" />
\`\`\`
`
  const output = removeSpotifyComponents(input)
  assert.doesNotMatch(output, /^import SpotifyPlayer/m)
  assert.doesNotMatch(output, /open\.spotify\.com/)
  assert.doesNotMatch(withoutFencedCode(output), /<SpotifyPlayer\b/)
  assert.match(output, /<SpotifyPlayer uri="spotify:user:person:playlist:example-only" \/>/)
})

test("numeric prose ordinals are escaped without touching code or frontmatter tags", () => {
  const input = "**RULE #1** and #5.\n\n`#2`\n\n```text\n#3\n```\n"
  const result = escapeNumericOrdinalTags(input)
  assert.equal(result.count, 2)
  assert.match(result.body, /RULE \\#1/)
  assert.match(result.body, /and \\#5/)
  assert.match(result.body, /`#2`/)
  assert.match(result.body, /```text\n#3/)
})

test("currency prose is protected from accidental math parsing without touching code", () => {
  const input = "Revenue rose from $100 to $120 at 20%.\n\n`cost=$5`\n\n```sh\nprice=$9\n```\n"
  const result = escapeCurrencyDollars(input)
  assert.equal(result.count, 2)
  assert.match(result.body, /\\\$100 to \\\$120/)
  assert.match(result.body, /`cost=\$5`/)
  assert.match(result.body, /price=\$9/)
})

test("the immutable Spotify source is recognized and removed from migrated output", async () => {
  const manifest = await corpusManifestPromise
  const affected = manifest.documents.filter(
    (document) => document.specialTransformations.spotifyRemoval > 0,
  )
  assert.deepEqual(
    affected.map((document) => document.quartzDestination),
    ["music/index.md", "20.gatsby-theme-features/index.md"],
  )
  assert.equal(manifest.summary.transformations.spotifyRemoval, 4)
  for (const document of affected) {
    const prose = withoutFencedCode(document.output)
    assert.doesNotMatch(prose, /<SpotifyPlayer\b/)
    assert.doesNotMatch(prose, /<iframe[\s\S]*?open\.spotify\.com/i)
  }
})

test("the 5AM Club ordinals stay visible but do not become taxonomy", async () => {
  const manifest = await corpusManifestPromise
  const affected = manifest.documents.filter(
    (document) => document.specialTransformations.numericOrdinalEscape > 0,
  )
  assert.deepEqual(
    affected.map((document) => document.quartzDestination),
    ["90-5ac-robin-sharma/index.md"],
  )
  assert.equal(affected[0].specialTransformations.numericOrdinalEscape > 0, true)
  assert.deepEqual(affected[0].tags, ["nfwyt", "personal-development"])
  assert.doesNotMatch(affected[0].output, /(?<!\\)#[1-5]\b/)
})

test("warning-producing currency prose is repaired in only the six traced documents", async () => {
  const manifest = await corpusManifestPromise
  const affected = manifest.documents.filter(
    (document) => document.specialTransformations.currencyDollarEscape > 0,
  )
  assert.deepEqual(
    affected.map((document) => document.quartzDestination),
    [
      "140-ego-is-the-enemy/index.md",
      "60-qfw-charlie-munger/index.md",
      "92-naval-ravikant-the-angel-philosopher/index.md",
      "93-wb-and-cm-faqs/index.md",
      "94-qfw-wb-management-secrets/index.md",
      "95-qfw-tao-of-warren-buffett/index.md",
    ],
  )
})

test("react-live metadata becomes a normal code fence", () => {
  assert.equal(normalizeReactLiveMetadata("```js react-live\nvalue\n```"), "```js\nvalue\n```")
})

test("malformed table separators are repaired and valid tables are preserved", () => {
  const malformed = "| Flag | Description |\n| --- | --- | --- |\n| -m | Parallel |"
  assert.equal(
    normalizeTableSeparators(malformed),
    "| Flag | Description |\n| --- | --- |\n| -m | Parallel |",
  )
  const valid = "| Flag | Description |\n| :--- | ---: |\n| -m | Parallel |"
  assert.equal(normalizeTableSeparators(valid), valid)
})

test("local asset references adopt exact on-disk casing", () => {
  const output = normalizeLocalAssetCasing(
    "![Screenshot](./ListBucketResult.png)\n![Other](./other.png)",
    ["ListBucketResult.PNG"],
  )
  assert.match(output, /\.\/ListBucketResult\.PNG/)
  assert.match(output, /\.\/other\.png/)
})

test("the three known missing references have explicit outcomes", async () => {
  const manifest = await corpusManifestPromise
  const post24 = manifest.documents.find((document) =>
    document.sourcePath.includes("24-things-that-my-new-site-should-have"),
  )
  const post52 = manifest.documents.find((document) =>
    document.sourcePath.includes("52-sre-reliability-engineering"),
  )
  assert.equal(post24.specialTransformations.assetReplacement, 1)
  assert.match(post24.output, /\.\/of10a\.png/)
  assert.doesNotMatch(post24.output, /\.\/of10\.png/)
  assert.equal(post52.specialTransformations.missingImageRemoval, 2)
  assert.doesNotMatch(post52.output, /!\[[^\]]*\]\(\.\/(?:sreh|tbs)\.jpeg/)
})

test("duplicate asset basenames are pinned to their owning generated paths", async () => {
  const manifest = await corpusManifestPromise
  for (const destination of [
    "57-firebase-rules",
    "58-firebase-basics-to-events",
    "120-maven-creating-fat-aka-uber-jar",
  ]) {
    const document = manifest.documents.find((entry) =>
      entry.quartzDestination.startsWith(`${destination}/`),
    )
    assert.ok(document.output.includes(`](/${destination}/`))
  }
})

test("missing assets are reported when no explicit exception exists", async (context) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "gatsby-missing-"))
  context.after(() => fs.rm(root, { recursive: true, force: true }))
  const directory = path.join(root, "posts", "01-example")
  await fs.mkdir(directory, { recursive: true })
  await fs.writeFile(
    path.join(directory, "index.mdx"),
    "---\ntitle: Example\nslug: /example\n---\n\n![Missing](./missing.png)\n",
  )
  const manifest = await buildCorpusManifest({ source: root })
  assert.match(manifest.errors.join("\n"), /missing local asset \.\/missing\.png/)
})

test("unknown authored components are rejected but fenced examples are ignored", async (context) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "gatsby-component-"))
  context.after(() => fs.rm(root, { recursive: true, force: true }))
  const directory = path.join(root, "pages", "example")
  await fs.mkdir(directory, { recursive: true })
  await fs.writeFile(
    path.join(directory, "index.mdx"),
    "---\ntitle: Example\nslug: /example\n---\n\n<UnknownWidget />\n\n```jsx\n<Example />\n```\n",
  )
  const manifest = await buildCorpusManifest({ source: root })
  assert.match(manifest.errors.join("\n"), /UnknownWidget/)
  assert.doesNotMatch(manifest.errors.join("\n"), /Example/)
})

test("route collision audit detects canonical and alias conflicts", () => {
  const documents = [
    {
      sourcePath: "posts/a/index.mdx",
      quartzCanonicalUrl: "/same/",
      requiredAliases: ["/legacy/"],
    },
    {
      sourcePath: "posts/b/index.mdx",
      quartzCanonicalUrl: "/same/",
      requiredAliases: ["/legacy/"],
    },
  ]
  const errors = auditRouteCollisions(documents).join("\n")
  assert.match(errors, /canonical collision/)
  assert.match(errors, /alias collision/)
})

test("route collision audit detects alias-to-canonical conflicts and self redirects", () => {
  const documents = [
    { sourcePath: "a", quartzCanonicalUrl: "/a/", requiredAliases: ["/b/"] },
    { sourcePath: "b", quartzCanonicalUrl: "/b/", requiredAliases: ["/b/"] },
  ]
  const errors = auditRouteCollisions(documents).join("\n")
  assert.match(errors, /alias\/canonical collision/)
  assert.match(errors, /self redirect/)
})

test("the complete link graph has no broken or deferred targets", async () => {
  const manifest = await corpusManifestPromise
  const links = manifest.documents.flatMap((document) => document.internalLinks)
  assert.equal(
    links.filter((link) => ["missing-target", "missing-fragment"].includes(link.classification))
      .length,
    0,
  )
  assert.equal(manifest.errors.length, 0)
})

test("full migration reruns byte-for-byte and leaves source immutable", async (context) => {
  const destination = await fs.mkdtemp(path.join(os.tmpdir(), "quartz-gatsby-full-"))
  context.after(() => fs.rm(destination, { recursive: true, force: true }))
  const sourceBefore = await snapshot(sourceRoot)

  await migrateCorpus({ source: sourceRoot, destination })
  const first = await snapshot(destination)
  await migrateCorpus({ source: sourceRoot, destination })
  const second = await snapshot(destination)
  const sourceAfter = await snapshot(sourceRoot)

  assert.deepEqual(second, first)
  assert.deepEqual(sourceAfter, sourceBefore)
})

async function snapshot(root) {
  const result = new Map()
  async function visit(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const fullPath = path.join(directory, entry.name)
      if (entry.isDirectory()) await visit(fullPath)
      else {
        const digest = crypto
          .createHash("sha256")
          .update(await fs.readFile(fullPath))
          .digest("hex")
        result.set(path.relative(root, fullPath), digest)
      }
    }
  }
  await visit(root)
  return result
}
