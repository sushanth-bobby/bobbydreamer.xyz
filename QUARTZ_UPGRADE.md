# Quartz upgrade runbook

Quartz upgrades are intentional maintenance events. Dependency availability,
Dependabot output, or a successful rehearsal does **not** authorize changing the
working site. The principle is: **upgrade the engine, preserve the site**.

## 1. Before an upgrade

1. Read `CUSTOMIZATIONS.md`, `CUSTOMIZATION_REGISTRY.md`, and `SITE_CONTRACT.md`.
2. Record `git status`; preserve unrelated user changes.
3. Record the site HEAD, merge base, Quartz version/commit, Node/npm versions,
   package/plugin versions, and current corpus/media snapshots.
4. Fetch the authoritative upstream remote and select an exact release or
   commit. Read official release notes, migration guidance, and relevant diffs.
5. Compare `merge-base → target` separately from `merge-base → site HEAD`.
6. Map every changed API, default, class, config entry, dependency, and conflict
   to `QZ-CUST-*` IDs. Produce a compatibility matrix and a reason to upgrade.
7. Run `npm run validate:upgrade` on the untouched baseline and record results.

## 2. Disposable rehearsal

8. Create an isolated clone/worktree with the same required sibling migration
   authority. Do not perform the rehearsal in the known-good checkout.
9. Attempt the upstream merge first and record conflicts without guessing.
10. Preserve site-owned scripts, `@bdv/*` packages, content, design, and
    production tooling. Apply only target engine/ecosystem changes.
11. Rebuild every affected local-package `dist` artifact from source.
12. Run `npm ci` (or the target's documented clean install), then
    `npm run validate:upgrade`.
13. Compare baseline/candidate routes, generated HTML, content index semantics,
    bundle changes, media evidence, and audit results.
14. Run `npm run validate:upgrade:served` under Caddy and the browser matrix in
    `SITE_CONTRACT.md`.
15. Record every mismatch as an explicit adapter task or accepted upstream
    change. Delete the disposable workspace only after the evidence is saved.

## 3. Decision gate — explicit user approval required

Stop here and present:

- why the upgrade is useful;
- exact target commit/version;
- affected customization IDs;
- conflicts and required adapter changes;
- automated, served, and browser results;
- security/dependency differences;
- unresolved risks and rollback plan.

The real repository must not be upgraded until the user explicitly approves
that target and scope.

## 4. Approved upgrade

16. Create the approved upgrade branch from the current known-good state.
17. Apply the rehearsed dependency/engine changes; do not copy an unreviewed
    fresh Quartz template over the site.
18. Adapt only the mapped boundaries. Prefer a narrow `@bdv/*` adapter change;
    keep media processing, migration, IA, content, and design independent.
19. Exclude upstream automatic-merge workflows. Quartz dependency updates must
    remain review-driven.
20. Rebuild local packages and run the complete static, served, and browser
    contract.
21. Capture the serving revision, immutable image digest, full traffic map,
    service URL, Firebase rewrite, and public-invoker state as the explicit
    rollback target before any Cloud Build or deployment mutation.
22. Run `npm run deploy:check`, build the production Docker image through Cloud
    Build, and create a replacement Cloud Run revision with zero production
    traffic plus a temporary revision-routing tag.
23. Validate the tagged candidate with the Caddy/live contracts and browser
    checks, including Search/Graph cache safety, media, metadata, 404 behavior,
    routes/aliases, mobile layout, and both themes. Do not promote a merely
    ready revision.
24. Promote only after candidate PASS. Re-run direct Cloud Run and public
    Firebase validation, then use the browser profile warmed against the prior
    release to prove Search navigation, Graph, assets, responsive media, and
    old/new canonical routes without clearing cache.
25. Roll production traffic back to the recorded revision before investigating
    any important post-switch regression. Remove only the temporary candidate
    tag after success; retain the prior revision/image until rollback confidence
    is adequate.
26. Close the maintenance event by updating the production baseline,
    customization registry, investigation history, production runbook, and one
    completion report with the final source identity, hashes, image digest,
    revision, validation evidence, and rollback result.

## 5. Failure and rollback

Any unexplained important regression means **STOP**. The current known-good
Quartz remains authoritative. Do not modify content, regenerate source media,
delete site-owned code, or weaken tests to force a pass. For a deployed failure,
follow `PRODUCTION.md` and restore the recorded prior Cloud Run revision before
further diagnosis.

## Prohibited shortcuts

- Automatic Quartz upgrades or automatic dependency-PR merging.
- Treating a similarly named native feature as equivalent without contract proof.
- Rebuilding from a clean template and copying content into it.
- Using `content-backup` or retired migration tools as authority.
- Editing only generated local-package output instead of its source.
- Running bare `npx quartz`; use the repository scripts.
- Performing a real upgrade merely because a rehearsal passed.
