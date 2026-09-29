# Phase 8B–8C Quartz investigation and rehearsal — 2026-09-29

## Decision summary

**Rehearsal result: PASS with bounded dependency-only changes.**

**Final production status (2026-09-29): ADOPTED / PHASE 8 COMPLETE.** The
approved dependency-only target was applied to the real `v5` checkout, passed
the complete static, Caddy-served, container, zero-traffic candidate, direct,
public, and warmed-browser contracts, and became the production baseline
without Quartz engine, site adapter, content, CSS, or media-processor source
changes. The initial authenticated-preflight blocker recorded during execution
was cleared later that day; the historical Phase 8C boundary and its then-open
risk are retained below, followed by the final closure.

Execution evidence and the precise boundary are recorded in
`..\..\bdv4q2-codex-todo\Quartz 5 — Phase 8 Intentional Upgrade and Maintenance Closure Completion Report.md`.

## Baseline and target

| Item                         | Value                                                                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Site HEAD used               | `ed9ada66b2a4fa99a9385f435568f65ec4a3d529`                                                                                 |
| Quartz version               | `5.0.0`                                                                                                                    |
| Upstream merge base          | `f1fba3fc55cbf60a60a5d09c95a49c042cdab63a` — `fix(schema): allow null for analytics field (#2485)`                         |
| Latest upstream `v5` checked | `97a2d05f80c4c50534959b1d0d41cc4b3895625e` (2026-09-20)                                                                    |
| Latest v5 tag                | [`v5.0.0`](https://github.com/jackyzha0/quartz/releases/tag/v5.0.0), tag target `ab346fa66a895e12d63a308e70ce330ba795822a` |
| Official branch              | [`jackyzha0/quartz@v5`](https://github.com/jackyzha0/quartz/tree/97a2d05f80c4c50534959b1d0d41cc4b3895625e)                 |
| Divergence before rehearsal  | site: 12 commits; upstream: 8 commits after the merge base                                                                 |

GitHub has no v5 GitHub Release entry; v5 is represented by the tag and branch.
The public "latest release" API still points to v4.0.8, so release discovery must
not rely on that API alone.

## Upstream change analysis

The complete upstream diff from the site's merge base touches only:

- `.github/dependabot.yml`;
- a new `.github/workflows/dependabot-automerge.yaml`;
- `package.json`;
- `package-lock.json`.

There are no upstream changes in `quartz/`, component source, the plugin loader,
configuration schema, layout, styles, emitters, or build implementation. The
substantive change is adoption of the Quartz ecosystem's 1.0 packages, theme
core 2.0.0, and routine production/tooling dependency updates. The final
upstream commit is [97a2d05](https://github.com/jackyzha0/quartz/commit/97a2d05f80c4c50534959b1d0d41cc4b3895625e).

The upstream automatic-merge workflow is intentionally **not** recommended for
this site because it conflicts with the approval-gated maintenance policy.

## Compatibility matrix

| Area              | Current site                               | Upstream delta                              | Impact / rehearsal result                       | IDs                     |
| ----------------- | ------------------------------------------ | ------------------------------------------- | ----------------------------------------------- | ----------------------- |
| Layout/page types | Heavily customized local packages          | No engine/layout source change              | Pass; no adapter edit                           | 006, 008, 009, 012      |
| Explorer          | Intentionally removed                      | Dependency version only                     | No behavior change                              | 018                     |
| TOC               | Conditional Blog Article behavior          | TOC package 0.x→1.0.0                       | Pass; 54 expected/rendered, article checks pass | 013                     |
| Search            | Content-addressed cache-safe index         | Search/content-index 0.x→1.0.0              | Pass; Search works and cache contract passes    | 007, 020                |
| Graph             | Global homepage integration                | Graph 0.x→1.0.0                             | Pass; homepage registration/browser check       | 014                     |
| Media             | Independent processor + thin adapter       | Types/utils/plugin ecosystem change         | Pass; processor unchanged; adapter rebuild only | 022                     |
| Styling/themes    | Site-owned tokens and CSS                  | Theme core 1.x→2.0.0; default remains 1.0.1 | Pass at three widths/two themes                 | 015–017                 |
| Routing/aliases   | Canonical, aliases, dotted paths, Caddy    | No engine source change                     | Pass; committed Caddy route/cache matrix        | 003, 004                |
| Local packages    | Source plus generated `dist`               | Types/utils 1.0 contract                    | Pass; 11 entry points match; no source change   | 019                     |
| Build/deploy      | In-tree bootstrap, finalizer, Docker/Caddy | Dependency manifests only                   | Pass; finalized output served by Caddy 2.11.4   | 004, 019, 020           |
| Content/editorial | 155 documents, Learning Archive            | No content change                           | Pass; exact inventory/contexts preserved        | 001, 002, 005, 010, 021 |

No current custom implementation should be replaced by a native feature in this
upgrade: upstream contains no corresponding feature-source change to evaluate.

## Disposable rehearsal procedure

1. Cloned site HEAD into an isolated sibling directory so the immutable
   `GatsbyMigration/content-original` authority resolved exactly as production
   tests expect.
2. Attempted `git merge --no-commit --no-ff upstream/v5` first. Exactly two
   conflicts occurred: `package.json` and `package-lock.json`.
3. Preserved site scripts and all seven `@bdv/*` packages; adopted upstream
   dependency versions for shared packages; moved the site-only Excalidraw
   plugin to its compatible 1.0.0 release; regenerated the lockfile.
4. Rebuilt the media adapter and plugin index. No adapter source was edited.
5. Ran the full automated/static and browser contracts.

The first temp clone was deliberately rejected as evidence because its location
did not reproduce the required Gatsby sibling and ignored generated `dist`
artifacts. After correcting the workspace topology, all 226 tests passed. This
is a rehearsal-environment lesson, not an upgrade defect.

## Evidence

| Gate                 | Baseline                                            | Candidate                                          |
| -------------------- | --------------------------------------------------- | -------------------------------------------------- |
| Unit/migration       | 226/226 pass, 45 suites                             | 226/226 pass, 45 suites                            |
| TypeScript/Prettier  | Pass                                                | Pass                                               |
| Content audit        | 155 documents; 150 articles; 90 Learning Archive    | Identical                                          |
| Local package parity | 11 generated entry points                           | 11 generated entry points                          |
| Media                | 487 referenced sources; 303 derivatives             | Identical; clean then warm cache pass              |
| Production build     | 155 parsed; 1,328 emitted files; 225 finalized HTML | Identical counts                                   |
| Production validator | 150 articles; 90 contexts; 224 sitemap pages        | Identical                                          |
| Cache validator      | Pass                                                | Pass with new content-addressed hash               |
| Media output         | 488 occurrences; 166 responsive; 303 derivatives    | Identical                                          |
| Production audit     | 2 high advisories (`sharp`, `brace-expansion`)      | 1 high advisory (`brace-expansion`); `sharp` fixed |

Generated-output comparison found 1,328 paths in each build. After normalizing
content-addressed filenames and CRLF/LF, all 253 HTML files are identical. The
content index has identical keys and fields; 36 `content` strings differ only
by CRLF→LF normalization. Bundle filename/content changes are expected from the
package upgrades and remain content-addressed.

Browser checks covered Home, Blog, Topics, a TOC article, and a media-heavy
article at 1440×900, 900×900, and 390×844, including light/dark, Search, Graph,
tags, TOC, intrinsic/responsive media, and overflow. Search returned the Quartz
tag/article, there were no console errors, and only Plausible's expected
localhost warning appeared.

## Phase 8C Final — served production gate

**Result: PASS.** The fixed candidate at upstream target
`97a2d05f80c4c50534959b1d0d41cc4b3895625e` was recreated from site baseline
`ed9ada66b2a4fa99a9385f435568f65ec4a3d529` in a disposable sibling clone. The
resolution again preserved all site-owned scripts and seven `@bdv/*` packages,
used the compatible Excalidraw 1.0 line, regenerated the lockfile, and rebuilt
generated local-package output. No Quartz engine, adapter source, content,
configuration, Caddy, or acceptance-test change was required, and the upstream
Dependabot auto-merge workflow was not imported.

### Environment and commands

- Windows NT 10.0.26200.0; Node `v26.5.0`; npm `11.17.0`.
- Docker was unavailable. The documented direct-production fallback served the
  finalized candidate through the unchanged committed `Caddyfile` using the
  official portable Caddy `v2.11.4` binary. Its release ZIP was verified against
  the published SHA-512 value
  `cd5ccfd86a4b40732cf715890d0dca5bf3f63adefec5a7914de85adf240c60ce7e5d2791631b88ef9758e46b23bb1730e020b9c5d696889740b284ffd4788e35`.
- Candidate preparation used `git clone --local --no-hardlinks --branch v5`, an
  exact fetch of `97a2d05f80c4c50534959b1d0d41cc4b3895625e`, the previously
  rehearsed shared dependency versions, `npm install`, and `npm run preserve`.
- Gates executed: `npm run validate:upgrade`, `npm audit --omit=dev`,
  `caddy validate --config .\\Caddyfile --adapter caddyfile`, Caddy with
  `QUARTZ_ROOT` set to the candidate `public/`,
  `npm run validate:upgrade:served`, and
  `npm run validate:live -- http://localhost:8080`.

### Static and served evidence

- `validate:upgrade` passed: 230/230 tests in 45 suites; TypeScript and Prettier
  passed; all 11 generated local-package entry points matched source.
- Content remained 155 documents and 150 Blog Articles. Media remained 487
  referenced sources and 303 derivatives, with clean/warm cache validation.
- Production output remained 1,328 emitted files and 225 finalized HTML files.
  Production validation passed for 150 article compositions, 90 Learning
  Archive contexts, 150 chronology entries, 224 sitemap pages, RSS, and robots.
- Cache validation passed with 348 immutable content-hashed resources and 980
  stable revalidated resources. Media output remained 488 occurrences, 166
  responsive occurrences, and 303 unique derivatives.
- The production audit still reports one high `brace-expansion` advisory. The
  previous baseline `sharp` advisory remains absent from the candidate.
- `validate:upgrade:served` passed the committed Caddy matrix for canonical
  routes, slash redirects, dotted routes/assets, historical and Quartz 4
  aliases, query preservation, and 404 behavior. `validate:live` additionally
  passed public canonical metadata, 404 noindex, immutable content-addressed
  Search/Graph data, stable-resource revalidation, and removal of the stable
  content-index URL.

### Served browser evidence

The production-served browser matrix covered 14 representative routes at
1440×900, 900×900, and 390×844 in light and dark themes: Home, Blog, the 2021
archive, Topics, native Python tag, T.I.L, iRevere, About, Music, and five Blog
Articles spanning short/long titles, TOC/no-TOC, one/multiple tags, current and
Learning Archive contexts, and responsive/non-responsive images. All 84 states
had the expected composition and zero page-level horizontal overflow. Image
elements retained intrinsic width/height, responsive images retained `srcset`,
and intentional non-responsive sources remained intact.

Search, homepage local/global Graph, theme switching, primary navigation, and
numeric Previous/Next were exercised successfully. A warmed-browser transition
loaded the known-good `contentIndex-f8d67885c8b45980.json`, switched the same
origin to the candidate without clearing browser state, then correctly loaded
`contentIndex-6a7385d3f4ba0207.json`; Search continued to return the Quartz tag
and article. There were zero browser console errors. The only warning was the
documented Plausible localhost `Ignoring Event` message. Visual inspection found
no unexpected composition or design difference.

### Final comparison and remaining risk

Serving through Caddy changed no conclusion from the earlier static rehearsal:
canonical routing, aliases/redirects, dotted routes, 404 handling, cache
headers, browser behavior, and every `QZ-CUST-*` ownership/compatibility
assessment remain unchanged. No source or adapter modification became
necessary. The only evidence-count difference is the maintenance suite's four
new registry/runbook tests, increasing 226 to 230 tests.

The remaining uncertainty is deployment-environment-only: this machine could
not execute the Docker image itself, and no Cloud Run/Firebase deployment or
live-domain smoke test was authorized. The exact Caddy runtime version and the
committed production configuration/output boundary were exercised locally;
container construction and authenticated cloud state remain gates for a later,
explicitly approved release. Phase 8C evidence is complete, but the real
repository remains unupgraded and Phase 8D still requires a separate user
decision.

## Phase 8 final closure

**Adopted in production on 2026-09-29.** The user explicitly approved target
`97a2d05f80c4c50534959b1d0d41cc4b3895625e`; it was applied to the real
repository, built successfully by Cloud Build, deployed as a zero-traffic
Cloud Run candidate, validated directly, and promoted to production revision
`bdxyz-p8-20260929-230737-ed9ada66b2a4`. Direct Cloud Run, public Firebase,
Search, Graph, routes/aliases, metadata/404, cache headers, media, mobile/theme,
and the old-production-to-new-production warmed-browser transition passed. No
Quartz engine, `@bdv/*` adapter source, media processor, content, design, route,
or information-architecture change was required. The previous production
revision/image remains the rollback target and rollback was not required.

The final execution evidence is maintained in
`../bdv4q2-codex-todo/Quartz 5 — Phase 8 Intentional Upgrade and Maintenance Closure Completion Report.md`.
