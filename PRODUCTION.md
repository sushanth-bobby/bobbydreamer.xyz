# bobbydreamer.xyz production runbook

This is the build, deployment, rollback, and operations authority for `bdv4q2`. See `CUSTOMIZATIONS.md` for customization architecture and Quartz upgrade procedure.

## Production architecture

```text
bobbydreamer.xyz
  → Firebase Hosting
  → rewrite to Cloud Run service bdxyz in asia-south1
  → Docker container on port 8080
  → Caddy
  → Quartz static output at /srv
```

The repository's `firebase.json`, `Dockerfile`, and `Caddyfile` implement that topology. The project ID `bdxyz-000001` used below is an intentionally sanitized public-documentation example, not a deployable environment identifier. Resolve the operational project from the authenticated `gcloud` context; confirm its account, project, IAM policy, active revision, and Firebase project before a production change. Service `bdxyz` and region `asia-south1` remain repository configuration and must also be reconciled with live state.

## Routine publishing

The normal personal-blog workflow is intentionally small:

```powershell
npm run serve
npm run deploy:check
npm run deploy:production
```

`deploy:check` is the read-only cloud preflight. It runs the authoritative repository gates, reports current content/TOC counts, verifies the active gcloud account/project, Cloud Build access, the one production Cloud Run service and revision, public IAM, and the existing Firebase Hosting rewrite. It never submits a build, deploys a revision, changes traffic, IAM, or Firebase.

`deploy:production` repeats the gates after `npm ci`, shows the exact target and release summary, and requires an explicit human confirmation. It builds one immutable GCR image, asks the operator to warm a normal browser against current production, starts one replacement Cloud Run revision without traffic, and moves production to it only after Cloud Run reports it ready. It then validates the direct service and public domain, including the cache contract, and requires both fresh- and warmed-browser confirmation. A failure after traffic changes automatically restores the recorded prior revision and verifies the previous public homepage hash.

A clean committed tree is preferred. A dirty tree is never deployed silently: the release is marked `-dirty`, the changed paths are recorded in an ignored private execution record, and the operator must type `DEPLOY DIRTY`. Deployment records live under ignored `private/deployments/`; they contain no credentials and must not be committed.

The workflow maintains one public production site. The readiness-only revision is temporary Cloud Run machinery, not a permanent candidate environment. Old revisions and images are not deleted automatically; inventory and confirm exact cleanup targets after a successful smoke test.

## Author and preview

Create a post as a self-contained folder such as:

```text
content/153-example-post/
  index.md
  diagram.svg
```

Use supported frontmatter (`title`, `date`, `description`, and `tags`). A valid date selects Blog Article presentation. A numeric folder prefix independently controls Latest, the all-article Blog order, and Previous/Next.

```powershell
npm run serve
```

Quartz preview is for authoring. If a file is deleted during a running preview, restart the preview before trusting absence of the old route. Production clean-URL behavior must be checked with Caddy.

Never run bare `npx quartz`. Use only:

```powershell
npm run serve
npm run build
npm run quartz -- <command>
```

## Build and release gates

Run from the repository root:

```powershell
npm ci
npm test
npx tsc --noEmit
npm run build
node scripts/migrate-gatsby.mjs --check
node scripts/validate-gatsby.mjs --public public
npm run validate:packages
npm run validate:production
node scripts/audit-toc.mjs --public public --output '..\bdv4q2-codex-todo\Quartz 5 — Phase 5 TOC Audit.md'
npm run check
git diff --check
```

`npm run deploy:check` owns this sequence for routine publishing and adds `npm run validate:cache`. The explicit commands remain documented for debugging.

`npm run build` invokes the in-tree Quartz 5 CLI and then finalizes production canonical/social metadata. Do not deploy output from `npm run serve`.

When Caddy is available:

```powershell
caddy validate --config .\Caddyfile
$env:QUARTZ_ROOT = (Resolve-Path .\public).Path
caddy run --config .\Caddyfile
```

In another shell:

```powershell
npm run validate:caddy
```

The build currently emits one understood plugin-index warning for each explicitly configured local `@bdv/*` package because those packages do not publish `dist/index.d.ts`. They are loaded by the YAML configuration and validated by tests, the site build, and `validate:packages`. LaTeX/KaTeX warnings and unexpected reference failures must remain zero.

## Cache-safe release contract

`npm run build` finalizes Quartz's stable `static/contentIndex.json` into `static/contentIndex-<sha256>.json` and rewrites every emitted application page to that content-specific URL. Search and Graph continue to consume the same Quartz `fetchData` promise; only the generated resource identity changes. A new application release can therefore never consume an incompatible prior Search index from a warmed browser cache.

Caddy returns `public, max-age=31536000, immutable` only for content-hashed JS, CSS, and JSON. HTML, RSS, sitemap, robots, stable media, favicon, and other stable URLs return `no-cache`, which permits browser storage but requires revalidation before reuse. Validate this with:

```powershell
npm run validate:cache
npm run validate:live -- http://localhost:8080
```

## Manual recovery / debugging

Routine releases must use `npm run deploy:production`. The lower-level commands below remain for diagnosis and manual recovery.

The historical deployment uses Google Cloud Build and Google Container Registry. Preserve that path unless Google Cloud rejects it; if it does, stop and make an explicit registry decision rather than silently changing architecture.

Use an immutable release label, not `latest`:

```bash
PROJECT_ID="$(gcloud config get-value project)"
REGION=asia-south1
SERVICE=bdxyz
RELEASE=YYYYMMDD-HHMM-<git-sha>
IMAGE="gcr.io/${PROJECT_ID}/bdxyz:${RELEASE}"

test -n "$PROJECT_ID" && test "$PROJECT_ID" != "(unset)"
gcloud builds submit --tag "$IMAGE" .
gcloud run deploy "$SERVICE" \
  --image "$IMAGE" \
  --platform managed \
  --region "$REGION" \
  --port 8080 \
  --no-traffic
gcloud run services update-traffic "$SERVICE" \
  --region "$REGION" \
  --to-latest
```

Cloud Run keeps the currently serving revision active while the replacement starts. Do not run the traffic command unless the new revision is ready. The repository orchestrator performs and verifies this ordering automatically.

Confirm public invocation explicitly:

```bash
gcloud run services get-iam-policy "$SERVICE" --region "$REGION"
gcloud run services add-iam-policy-binding "$SERVICE" \
  --region "$REGION" \
  --member=allUsers \
  --role=roles/run.invoker
```

The IAM mutation is needed only when the policy does not already grant `roles/run.invoker` to `allUsers`.

Firebase Hosting owns the custom-domain entry path. Ordinary content/application publishing does not deploy Firebase. Deploy its rewrite only when `firebase.json` changed or when establishing/recovering the environment:

```bash
firebase deploy --only hosting --project "$PROJECT_ID"
```

Do not configure a second Cloud Run custom-domain route unless the architecture is deliberately changed in a later, separately approved phase.

## Post-deployment smoke test

First test the Cloud Run service URL reported by `gcloud run services describe`; then test `https://bobbydreamer.xyz`. Verify:

- `/`, a canonical article, `/blog/`, a year, `/topics/`, a tag, `/til/`, `/bio/`, and `/irevere/`;
- dotted article and owned asset routes;
- a historical alias and `/pages/about_me`;
- slash redirects and query preservation;
- `/robots.txt`, `/sitemap.xml`, and `/index.xml`;
- favicon/brand asset, Search, Theme, 404, and one mobile viewport;
- Search in both a fresh browser and a browser previously warmed against the prior production release; result links must use current canonical routes rather than a cached legacy index;
- canonical, OpenGraph, and Twitter URLs use `https://bobbydreamer.xyz`;
- no browser console errors other than Plausible intentionally ignoring localhost during local tests.

Record the deployed image digest, Cloud Run revision, Firebase Hosting release, smoke-test result, and deployment time.

## Rollback

Routine deployment records the previous production revision and automatically restores it when any post-switch gate fails. There is intentionally no separate high-complexity rollback system for this personal site.

List revisions and identify the last known-good immutable image/revision:

```bash
gcloud run revisions list --service "$SERVICE" --region "$REGION"
gcloud run services describe "$SERVICE" --region "$REGION"
```

Fast rollback routes all traffic to the known-good revision:

```bash
gcloud run services update-traffic "$SERVICE" \
  --region "$REGION" \
  --to-revisions KNOWN_GOOD_REVISION=100
```

Alternatively redeploy the previous immutable image tag with the same `gcloud run deploy` flags. If the Firebase rewrite itself changed, restore the previous Firebase Hosting release from the Firebase console or redeploy the known-good `firebase.json`. Re-run the public smoke matrix after rollback.

After a successful deployment and fresh/warmed smoke validation, review zero-traffic revisions, GCR images, and Cloud Build source objects as cleanup candidates. Keep current production until its replacement is proven. Never infer that App Engine/Firebase-owned buckets or Hosting releases are disposable merely from age or an empty object count.

## Quartz upgrades

Do not combine a production release with a Quartz/framework upgrade. Follow the upgrade procedure and all 21 customization records in `CUSTOMIZATIONS.md` in a separate phase.
