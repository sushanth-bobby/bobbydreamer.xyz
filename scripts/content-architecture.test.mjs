import assert from "node:assert/strict"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { test } from "node:test"
import { buildCorpusInventory, validateEditorialFrontmatter } from "./audit-content.mjs"

test("content inventory records durable corpus and editorial fields", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "bdv-content-audit-"))
  t.after(() => fs.rm(root, { recursive: true, force: true }))
  const articleRoot = path.join(root, "153-example")
  await fs.mkdir(articleRoot, { recursive: true })
  await fs.writeFile(path.join(articleRoot, "diagram.png"), "asset")
  await fs.writeFile(
    path.join(articleRoot, "index.md"),
    `---
title: Example
date: 2026-09-27
description: Example description
tags:
  - python
status: superseded
supersededBy: ../154-replacement/
authorship: ai
---

## First

Python prose with [an internal link](../152-old/) and [a source](https://python.org/).

### Second

![Diagram](./diagram.png)

\`\`\`python
print("not part of the prose word count")
\`\`\`
`,
  )

  const inventory = await buildCorpusInventory({ contentRoot: root, asOf: "2026-09-29" })
  const article = inventory.documents[0]
  assert.equal(inventory.errors.length, 0)
  assert.equal(article.sequence, 153)
  assert.equal(article.canonicalPath, "/153-example/")
  assert.equal(article.pageType, "blog-article")
  assert.equal(article.tocEligible, true)
  assert.equal(article.images.length, 1)
  assert.deepEqual(article.assets, ["diagram.png"])
  assert.equal(article.internalLinks.length, 1)
  assert.equal(article.externalLinks.length, 1)
  assert.equal(article.codeBlocks.length, 1)
  assert.ok(article.technologyProductReferences.includes("Python"))
  assert.equal(article.status, "superseded")
  assert.equal(article.authorship, "ai")
  assert.deepEqual(article.learningArchiveContexts, [])
})

test("editorial validation rejects ambiguous status and AI taxonomy", () => {
  const errors = validateEditorialFrontmatter({
    relativePath: "153-example/index.md",
    status: "superseded",
    supersededBy: null,
    authorship: "assistant",
    learningArchiveContexts: ["gsutil"],
    tags: ["wai", "3"],
  })
  assert.equal(errors.length, 5)
  assert.ok(errors.some((error) => error.includes("requires supersededBy")))
  assert.ok(errors.some((error) => error.includes("authorship")))
  assert.ok(errors.some((error) => error.includes("wai taxonomy")))
  assert.ok(errors.some((error) => error.includes("numeric tag")))
  assert.ok(errors.some((error) => error.includes("requires status: historical")))
})

test("Learning Archive contexts are historical, supported, and unique", () => {
  const errors = validateEditorialFrontmatter({
    relativePath: "153-example/index.md",
    status: "historical",
    supersededBy: null,
    authorship: "user",
    learningArchiveContexts: ["gsutil", "gsutil", "unknown"],
    tags: [],
  })
  assert.equal(errors.length, 2)
  assert.ok(errors.some((error) => error.includes("must not contain duplicates")))
  assert.ok(
    errors.some((error) => error.includes('unsupported Learning Archive context "unknown"')),
  )
})

test("the current corpus satisfies the Phase 6 editorial frontmatter contract", async () => {
  const inventory = await buildCorpusInventory({
    contentRoot: "content",
    manifestPath: "scripts/gatsby-migration-manifest.json",
    asOf: "2026-09-29",
  })
  assert.deepEqual(inventory.errors, [])
  assert.equal(inventory.summary.documents, 155)
  assert.equal(inventory.summary.blogArticles, 150)
  assert.equal(inventory.summary.numberedArticles, 150)
  assert.equal(inventory.summary.migratedDocuments, 153)
  assert.equal(inventory.summary.authoredDocuments, 2)
  assert.equal(inventory.summary.learningArchiveArticles, 90)
  assert.deepEqual(inventory.summary.byLearningArchiveContext, {
    gatsby: 9,
    "google-domains": 4,
    gsutil: 6,
  })
  assert.equal(inventory.summary.overlappingLearningArchiveContexts, 1)
  assert.deepEqual(inventory.summary.byStatus, { current: 65, historical: 90 })
})
