# bobbydreamer.xyz site contract

This contract answers one question after an engine change: **is the result still
bobbydreamer.xyz?** It combines the existing regression suites into an upgrade
acceptance gate. Snapshot counts are evidence for the current corpus, while the
behavioral rules are permanent.

## Automated gate

Run from the repository root:

```bash
npm run validate:upgrade
```

The command verifies the customization registry, 226+ unit/migration tests,
TypeScript and formatting, all local-package generated artifacts, the content
and editorial contract, the media cache, a production build, generated
composition/chronology/metadata, the cross-release cache contract, and emitted
responsive media.

The gate must remain green in both the known-good baseline and the disposable
candidate. A count change is acceptable only when explained by an intentional
content change; structural rules may not be waived to update a snapshot.

| Contract area       | Required invariants                                                                                     | Automated protection                              |
| ------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Content             | 155 current documents; numbered chronology; metadata, aliases, tags, and historical status remain valid | `npm test`, `validate:content`                    |
| IA                  | Home, Blog, derived years, Topics, T.I.L, iRevere, About, Music, numeric previous/next                  | IA/migration tests, `validate:production`         |
| Article composition | One title; tags then date/read time; Learning Archive context; conditional TOC; images                  | component tests, `validate:production`, TOC audit |
| Features            | Search, global homepage Graph, theme, favicon/logo                                                      | component/cache tests plus browser gate           |
| Media               | 491 immutable sources; deterministic derivatives; manifest/cache integrity; responsive output           | media tests, `media:verify`, `validate:media`     |
| Responsive design   | No page-level overflow; intentional desktop/tablet/mobile composition; light and dark tokens            | CSS/token tests plus browser gate                 |
| Production          | Docker/Caddy topology; canonical metadata; sitemap; RSS; 404; cache headers                             | production/cache validators plus served gate      |

## Served and browser gate

Automated static success is necessary, not sufficient. Build the production
image or serve `public/` through the committed Caddyfile, then run:

```bash
npm run validate:upgrade:served
```

The command expects Caddy to be listening at the URL documented by
`scripts/validate-caddy.mjs`. It proves canonical, alias, dotted-route, 404, and
cache-header semantics that Quartz preview cannot prove.

Browser-check these page classes at **1440×900**, **900×900**, and **390×844**
in both light and dark themes:

- Home: semantic greeting, Latest Articles, Working on, global Graph.
- Blog and one year archive: dates, descriptions, ordering, links.
- Topics and a native tag page: curated grouping without lost tag routes.
- T.I.L, iRevere, About, and Music.
- Blog Articles with short/long titles, TOC/no TOC, one/many tags, current and
  Learning Archive context, and responsive/non-responsive images.
- Search from a browser warmed against the previous release.

Require zero console errors, zero horizontal overflow, working Search/Graph/theme
interactions, intact intrinsic image dimensions and `srcset`, and no unexpected
visual/composition differences. Plausible's localhost-only "Ignoring Event"
warning is expected and is not a production error.

## Upgrade stop conditions

Stop and keep the current Quartz authoritative when any important route,
composition, behavior, media invariant, design token, cache rule, or production
server check differs without an approved explanation. Do not edit content to
make an engine regression disappear.
