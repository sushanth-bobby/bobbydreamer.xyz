import assert from "node:assert/strict"
import { test } from "node:test"
import type { VNode } from "preact"
import renderToString from "preact-render-to-string"
import type { QuartzComponentProps } from "./quartz/components/types"
import {
  ArticleContext,
  contentStatusMessages,
  getArticleContext,
  learningArchiveContextMessages,
} from "@bdv/quartz-content-context/components"

function render(frontmatter: Record<string, unknown>) {
  const Component = ArticleContext(undefined)
  return renderToString(
    Component({ fileData: { frontmatter } } as unknown as QuartzComponentProps) as VNode,
  )
}

test("current and AI-assisted user articles add no article-context markup", () => {
  assert.equal(render({ title: "User article" }), "")
  assert.deepEqual(getArticleContext({ title: "User article" }), {
    status: "current",
    authorship: "user",
    supersededBy: undefined,
    learningArchiveContexts: [],
  })
})

test("AI authorship is explicit metadata rather than a taxonomy tag", () => {
  const html = render({ title: "AI article", authorship: "ai", tags: ["research"] })
  assert.match(html, /class="article-authorship">Written by AI</)
  assert.doesNotMatch(html, /tag-link|>wai</)
})

test("Learning Archive and other statuses use centralized wording and successor links", () => {
  const historical = render({ status: "historical" })
  assert.match(historical, /Learning archive/)
  assert.match(historical, new RegExp(contentStatusMessages.historical.replaceAll(".", "\\.")))

  const superseded = render({ status: "superseded", supersededBy: "/154-replacement/" })
  assert.match(superseded, /Superseded article/)
  assert.match(superseded, /href="\/154-replacement\/"/)
  assert.match(superseded, /Read the successor article/)

  const journal = render({ status: "point-in-time" })
  assert.match(journal, /Point-in-time journal/)
})

test("special Learning Archive contexts render inside one coherent notice", () => {
  const gatsby = render({ status: "historical", learningArchiveContexts: ["gatsby"] })
  assert.equal((gatsby.match(/content-status-notice/g) ?? []).length, 1)
  assert.match(gatsby, new RegExp(learningArchiveContextMessages.gatsby.replaceAll(".", "\\.")))

  const googleDomains = render({
    status: "historical",
    learningArchiveContexts: ["google-domains"],
  })
  assert.match(googleDomains, /Google Domains has since migrated to Squarespace/)

  const gsutil = render({ status: "historical", learningArchiveContexts: ["gsutil"] })
  assert.match(gsutil, /<code>gsutil<\/code>/)
  assert.match(gsutil, /<code>gcloud storage<\/code>/)

  const overlapping = render({
    status: "historical",
    learningArchiveContexts: ["google-domains", "gsutil"],
  })
  assert.equal((overlapping.match(/content-status-notice/g) ?? []).length, 1)
  assert.equal((overlapping.match(/<li>/g) ?? []).length, 2)
})

test("Phase 6 registers article context after existing metadata", async () => {
  const { readFileSync } = await import("node:fs")
  const configuration = readFileSync("quartz.config.yaml", "utf8")
  const dockerfile = readFileSync("Dockerfile", "utf8")
  assert.match(
    configuration,
    /@bdv\/quartz-content-context[\s\S]*priority: 25[\s\S]*condition: blog-article/,
  )
  assert.match(dockerfile, /COPY quartz-content-context\/ \.\/quartz-content-context\//)
})
