# bobbydreamer.xyz customization registry

This is the upgrade index for the detailed records in
[`CUSTOMIZATIONS.md`](./CUSTOMIZATIONS.md). The site owns every requirement and
acceptance criterion below. "Quartz coupling" describes the narrowest upstream
surface that may need adaptation; it does not transfer ownership of the feature
to Quartz.

| ID          | Customization                                         | Ownership class                 | Quartz coupling                     | Risk   | Upgrade proof                                                       |
| ----------- | ----------------------------------------------------- | ------------------------------- | ----------------------------------- | ------ | ------------------------------------------------------------------- |
| QZ-CUST-001 | Migration corpus ownership and deterministic pipeline | Site capability                 | None                                | Medium | Full migration preflight, byte-equivalent rerun, immutable source   |
| QZ-CUST-002 | MDX transformations and repair ledger                 | Site capability                 | None                                | Medium | Migration fixtures and exact repair-ledger tests                    |
| QZ-CUST-003 | Canonical paths, aliases, and compatibility redirects | Site capability                 | Config, emitters, production server | High   | Route collision, canonical/alias, sitemap, Search, and Caddy matrix |
| QZ-CUST-004 | Caddy production URL semantics                        | Production tooling              | Generated paths only                | High   | Docker/Caddy route and cache-header matrix                          |
| QZ-CUST-005 | Numeric chronology and date separation                | Site capability                 | Component data contracts            | Medium | Chronology, archive, duplicate/gap, and previous/next tests         |
| QZ-CUST-006 | Page classification and conditional composition       | Site capability                 | Layout and component registry       | High   | Page-type fixtures plus representative generated pages              |
| QZ-CUST-007 | Identity, navigation, Search, and Theme header        | Site design/capability          | Component APIs                      | Medium | Header contract, Search/cache, theme, and responsive browser matrix |
| QZ-CUST-008 | Homepage, Working on, and Latest Articles             | Site capability/design          | Page component API                  | Medium | Homepage semantic, ordering, Graph, and browser checks              |
| QZ-CUST-009 | Blog and year archives                                | Site capability                 | Page-type and emitter APIs          | High   | Derived years, date ordering, archive titles/routes, sitemap        |
| QZ-CUST-010 | Topics, native tags, and taxonomy guard               | Site capability                 | Tag/page components                 | Medium | Curated group/link tests, all native tag routes, content audit      |
| QZ-CUST-011 | Numeric Previous/Next                                 | Site capability                 | Component props                     | Medium | Numeric neighbors across gaps, duplicates, and boundaries           |
| QZ-CUST-012 | Blog Article metadata composition                     | Site capability/design          | Layout and components               | High   | Exact title/tags/date/read-time ordering and empty-state checks     |
| QZ-CUST-013 | Blog Article TOC rule                                 | Site capability                 | TOC component/config                | Medium | Eligibility audit and generated TOC parity                          |
| QZ-CUST-014 | Homepage site-wide Graph                              | Site capability                 | Graph component API                 | Medium | Homepage-only registration, global mode, browser interaction        |
| QZ-CUST-015 | Brand mark, wordmark, and favicon                     | Site design                     | Asset/config hooks                  | Low    | Asset references, metadata, light/dark visual check                 |
| QZ-CUST-016 | Typography and responsive layout                      | Site design                     | Theme/CSS surface                   | Medium | Token tests and desktop/tablet/mobile overflow/title checks         |
| QZ-CUST-017 | Visual tokens and content presentation                | Site design                     | Theme/CSS and emitted classes       | Medium | CSS map, representative pages, both themes and breakpoints          |
| QZ-CUST-018 | Intentional removals and compatibility configuration  | Site policy                     | Config schema                       | Low    | Config registration/removal tests and representative pages          |
| QZ-CUST-019 | Local-package source/generated lifecycle              | Quartz adapter                  | Plugin loader and package contracts | High   | Rebuild all local packages; source/dist parity; TypeScript/build    |
| QZ-CUST-020 | Cache-safe publishing and replacement                 | Production tooling              | Emitted resource names              | High   | Release A/B cache simulation, production validator, deploy check    |
| QZ-CUST-021 | Editorial metadata and Learning Archive               | Site capability/content         | Rendering component API             | Medium | Ledger/content audit, context fixtures, generated wording parity    |
| QZ-CUST-022 | Media inventory, derivatives, cache, and adapter      | Site subsystem + Quartz adapter | Thin HAST/emitter adapter only      | Medium | Media unit/cache/source tests, manifest, HTML and browser checks    |

## Production compatibility baseline

All 22 records passed unchanged against the production-adopted Quartz 5.0.0
dependency baseline at upstream commit
`97a2d05f80c4c50534959b1d0d41cc4b3895625e` on 2026-09-29. Ownership,
Quartz coupling, adapter boundaries, and upgrade-risk classifications did not
change. The Cloud Build container, zero-traffic candidate, direct Cloud Run,
public Firebase path, Search/Graph cache contract, responsive media, and
warmed-browser transition all passed. The site-owned media processor,
`@bdv/quartz-media` adapter source, and Quartz core required no source changes.

## Ownership boundaries

- **Content:** 155 documents, 491 source-owned images, metadata, aliases,
  migration authority, and editorial ledgers are never Quartz-owned.
- **Site-owned capabilities:** information architecture, chronology, archives,
  Topics, Learning Archive, historical contexts, migration, Search/cache
  behavior, media processing, and deployment semantics survive engine
  replacement.
- **Site-owned design:** typography, brand, header/navigation, article
  composition, responsive behavior, image presentation, and both themes are
  acceptance requirements.
- **Quartz adapters:** the seven `@bdv/*` packages and their registration bridge
  site requirements to supported Quartz APIs. Adapter code may change; the
  requirement must not.
- **Quartz engine:** the in-tree upstream implementation and community packages
  are replaceable only through the approval-gated process in
  [`QUARTZ_UPGRADE.md`](./QUARTZ_UPGRADE.md).

## Registry rules

1. Read the detailed `QZ-CUST-*` record before changing an indexed area.
2. Map each upstream change/conflict to one or more IDs before editing code.
3. A native Quartz feature is a candidate, not an automatic replacement.
4. Update this table, `CUSTOMIZATIONS.md`, and `quartz-customizations.json`
   whenever ownership, coupling, risk, or verification changes.
5. No Quartz upgrade is authorized by a green rehearsal. Explicit user approval
   is still required.
