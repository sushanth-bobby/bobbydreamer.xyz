# Authoring bobbydreamer.xyz

This is the durable guide for adding or editing site content. Read `CONTENT_ARCHITECTURE.md` for editorial intent and `CUSTOMIZATIONS.md` for implementation details.

## Create a Blog Article

Find the next unused numeric sequence. Never renumber an existing folder; duplicate historical sequence values are intentional evidence and are handled deterministically.

```text
content/<number>-<slug>/
├── index.md
├── image.png
└── diagram.webp
```

Use a stable lowercase kebab-case slug. Keep every article-owned image or download beside `index.md` and reference it relatively.

Start with:

```yaml
---
title: Clear article title
date: YYYY-MM-DD
description: One concise sentence for Blog listings, Search, and social metadata.
tags:
  - reusable-tag
---
```

The date gives the page Blog Article presentation. The folder number independently controls Latest Articles, the all-article Blog order, RSS, and Previous/Next. A production chronological article needs both.

## Frontmatter contract

| Field                     | Rule                                                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `title`                   | Required. Describe the actual article; do not encode chronology in the title.                                                |
| `date`                    | Required for a Blog Article. Use the publication date as `YYYY-MM-DD`.                                                       |
| `description`             | Required for new articles. Write a useful listing/discovery summary; it is not repeated in the article body.                 |
| `tags`                    | Required for new Blog Articles. Use a short list of reusable lowercase kebab-case labels.                                    |
| `status`                  | Optional: `historical`, `superseded`, or `point-in-time`. Omission means current. Use only after evidence-based review.      |
| `learningArchiveContexts` | Optional only with `status: historical`; supported values are `gatsby`, `google-domains`, and `gsutil`.                      |
| `supersededBy`            | Required only with `status: superseded`; use the successor's canonical site path, such as `/154-new-approach/`.              |
| `authorship`              | Optional. Use only `ai` for intentionally substantially AI-authored work. Omit for normal user-authored or AI-assisted work. |
| `aliases`                 | Migration/compatibility-owned. Do not add casually or change a canonical route to create an alias.                           |
| `enableToc`               | Optional. Use `false` only when an otherwise eligible article should deliberately have no TOC.                               |

Example reviewed historical metadata:

```yaml
status: superseded
supersededBy: /154-current-approach/
```

For a migrated article, do not edit its generated Markdown to add these fields. Add the approved values under its destination key in `scripts/content-editorial-overrides.json`, then rerun the migration and validation. This preserves reproducibility and immutable Gatsby source.

## Tags and Topics

Tags are article metadata, not navigation design. Prefer an existing accurate tag before creating a spelling variant. For new tags:

- use lowercase kebab-case;
- use a singular form where it reads naturally;
- avoid numeric-only tags;
- avoid one-off labels unless the distinction is genuinely useful;
- never use `wai`; use `authorship: ai` when applicable.

Do not rewrite old tags merely to make them visually uniform. Topics are curated in the local Topics page component and should remain a small set of useful entry points. A tag does not automatically become a Topic.

## AI-assisted work

AI may help with research, source discovery, fact checking, outlines, drafting, editing, rewriting, code, tables, and summaries. Leave `authorship` absent when the project, experience, investigation, observations, conclusions, opinions, decisions, lessons, and final editorial control are yours.

Use `authorship: ai` only when the article is intentionally substantially investigated/authored by AI. The page will visibly say `Written by AI`.

## Learning Archive, historical, and superseded material

Do not silently rewrite an old tutorial into a present-day tutorial. First decide whether it is:

- current enough to remain unmarked;
- historically useful but technically dated (`historical`);
- replaced by a specific newer article (`superseded` plus `supersededBy`);
- intentionally a dated observation or decision (`point-in-time`).

Use `historical` for an article whose substantive purpose is preserving technical/programming learning from the technologies and versions available when it was written. It renders the standard Learning Archive notice. Do not run a compatibility rewrite merely because packages, runtimes, commands, screenshots, or practices have aged.

New technical articles are not automatically Learning Archive material. Age, one technology keyword, a generated chart, or a passing API mention is not enough. Investment journals, personal/project journals, conference/general notes, and historical decisions retain their own semantics unless the article is clearly and substantively technical learning.

For one of the three approved recurring contexts, add an array in the migrated article's override entry:

```json
{
  "status": "historical",
  "learningArchiveContexts": ["google-domains", "gsutil"]
}
```

The centralized component combines the standard notice and every supplemental note in one box. Do not paste warning HTML or repeated Markdown callouts into article bodies. Add another context type only when a repeated, durable reader need justifies updating the schema, renderer, migration validation, and tests.

`superseded` is different: use it only when a specific newer article replaces the old one and supply `supersededBy`. A product upgrade or the site's move from Gatsby to Quartz does not by itself make an old learning record superseded.

Investment journal entries are not outdated solely because prices, holdings, market conditions, or an incidental technology mention changed. Use `point-in-time` only when that context helps readers; do not turn the site into a recommendation service.

## Headings and TOC

- The component-rendered article title is the page H1. Begin article sections at H2.
- Use H2 and H3 for real hierarchy; avoid skipping levels.
- H1–H3 count toward the TOC. H4–H6 do not.
- The installed Quartz rule renders a TOC only when there are at least two eligible headings.
- Keep headings descriptive and stable; changing them can break incoming fragment links.

## Images, captions, and assets

Keep assets colocated with the article and reference them relatively:

```markdown
![Meaningful description](./diagram.png)
```

Use meaningful alt text when the image conveys information. Use empty alt text only for genuinely decorative images. Do not invent a description for an old image whose meaning cannot be established. Put caption text next to the image in ordinary Markdown until a dedicated caption syntax is documented.

PNG and JPEG/JPG are processed when the source is large enough for responsive delivery. Small raster images stay at their natural size, SVG remains vector, and animated or unsupported formats bypass responsive processing rather than being damaged. External images are not downloaded. The first local article image loads eagerly; later images load lazily. The build adds dimensions, decoding behavior, and responsive candidates without changing the Markdown.

Do not move files into a central image tree, resize them manually, create WebP copies, write `srcset`, or edit a generated manifest. Preserve the original format unless there is an authoring reason to choose another. `npm run serve` and `npm run build` run the media pipeline automatically; authors normally need no separate media command.

## Links and sources

- Prefer canonical internal paths and normal Markdown links.
- Link related articles where the relationship materially helps the reader.
- For a series, use consistent tags and direct previous/continued links rather than a complex relationship schema.
- Cite primary sources for technical facts when practical. Give external links descriptive text.
- When a new article replaces an old one, use `supersededBy` on the old article and link back from the new article when useful.

## Code

Use fenced code blocks with an accurate language identifier:

````markdown
```python
print("hello")
```
````

State relevant versions when behavior depends on them. Do not present untested generated code as verified. Keep secrets, service-account material, private identifiers, and credentials out of content and examples.

## About and personal wording

The About page contains personal facts and career history. Do not invent or auto-modernize biography, job, location, experience, project, or contact claims. Substantive wording changes require the user's review.

## Preview and validation

Use only the repository-owned Quartz runtime:

```powershell
npm run serve
```

Never use bare `npx quartz build --serve`. For a release-quality check:

```powershell
npm run validate:content
npm test
npm run check
npm run build
npm run validate:media
node scripts/migrate-gatsby.mjs --check
node scripts/validate-gatsby.mjs --public public
npm run validate:packages
npm run validate:production
npm run validate:cache
node scripts/audit-toc.mjs --public public --output "<report-path>"
git diff --check
```

Use Caddy, not Quartz preview, as route authority for dotted folders and production clean URLs. For layout-affecting changes, check representative desktop, tablet, and phone widths in both themes, including console errors and horizontal overflow.
