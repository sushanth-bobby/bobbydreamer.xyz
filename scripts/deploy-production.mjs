import { createHash } from "node:crypto"
import { spawn } from "node:child_process"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import process from "node:process"
import readline from "node:readline/promises"

export const productionService = "bdxyz"
export const productionRegion = "asia-south1"
export const productionOrigin = "https://bobbydreamer.xyz"
const cloudRunPollIntervalMs = 1_000
const cloudRunPollAttempts = 60

export const releaseGates = [
  ["npm", ["test"]],
  ["npm", ["run", "check"]],
  ["npm", ["run", "build"]],
  ["node", ["scripts/migrate-gatsby.mjs", "--check"]],
  ["node", ["scripts/validate-gatsby.mjs", "--public", "public"]],
  ["npm", ["run", "validate:packages"]],
  ["npm", ["run", "validate:production"]],
  ["npm", ["run", "validate:cache"]],
  ["git", ["diff", "--check"]],
]

export function deploymentPlan(mode) {
  const readOnly = [
    ["gcloud", ["auth", "list", "--filter=status:ACTIVE"]],
    ["gcloud", ["config", "get-value", "project"]],
    ["gcloud", ["run", "services", "describe", productionService]],
    ["gcloud", ["run", "revisions", "list", "--service", productionService]],
    ["gcloud", ["run", "services", "get-iam-policy", productionService]],
    ["gcloud", ["builds", "list", "--limit=1"]],
  ]
  if (mode === "check") return [...releaseGates, ...readOnly]
  return [
    ...releaseGates,
    ...readOnly,
    ["gcloud", ["builds", "submit"]],
    ["gcloud", ["run", "deploy", productionService]],
    ["gcloud", ["run", "services", "update-traffic", productionService, "--to-revisions"]],
  ]
}

const repositoryRoot = path.resolve(import.meta.dirname, "..")
const privateLogRoot = path.join(repositoryRoot, "private", "deployments")
const mode = process.argv[2] ?? "check"
let resolvedGcloudCommand

async function gcloudCommand() {
  if (resolvedGcloudCommand) return resolvedGcloudCommand
  for (const directory of (process.env.Path ?? process.env.PATH ?? "").split(path.delimiter)) {
    const candidate = path.join(directory, "gcloud.cmd")
    try {
      await fs.access(candidate)
      resolvedGcloudCommand = candidate
      return candidate
    } catch {}
  }
  throw new Error("gcloud.cmd is unavailable on PATH")
}

async function run(command, args, options = {}) {
  const { capture = false, env = process.env } = options
  if (!capture) console.log(`\n> ${command} ${args.join(" ")}`)
  let executable = command
  let executableArgs = args
  if (process.platform === "win32" && command === "npm") {
    if (!process.env.npm_execpath) throw new Error("npm_execpath is unavailable")
    executable = process.execPath
    executableArgs = [process.env.npm_execpath, ...args]
  } else if (process.platform === "win32" && command === "gcloud") {
    executable = process.env.ComSpec ?? "cmd.exe"
    executableArgs = ["/d", "/c", "call", await gcloudCommand(), ...args]
  }
  return await new Promise((resolve, reject) => {
    const child = spawn(executable, executableArgs, {
      cwd: repositoryRoot,
      env,
      shell: false,
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    })
    let stdout = ""
    let stderr = ""
    if (capture) {
      child.stdout.on("data", (chunk) => (stdout += chunk))
      child.stderr.on("data", (chunk) => (stderr += chunk))
    }
    child.on("error", reject)
    child.on("exit", (code) => {
      if (code === 0) resolve(capture ? stdout.trim() : undefined)
      else
        reject(
          new Error(
            `${command} ${args.join(" ")} failed (${code})${stderr ? `: ${stderr.trim()}` : ""}`,
          ),
        )
    })
  })
}

async function json(command, args) {
  const output = await run(command, [...args, "--format=json"], { capture: true })
  return JSON.parse(output)
}

function fingerprint(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 12)
}

async function sha256Url(url) {
  const response = await fetch(url, { cache: "no-store" })
  if (!response.ok) throw new Error(`${url} returned ${response.status}`)
  return createHash("sha256")
    .update(Buffer.from(await response.arrayBuffer()))
    .digest("hex")
}

function activeTraffic(service) {
  const entries = service.status?.traffic ?? []
  return entries.find((entry) => entry.percent === 100 && entry.revisionName)
}

export function replacementRevisionName(release) {
  return `${productionService}-p51-${release.slice(0, 28)}`
}

async function waitForRevisionReady(revisionName, digest) {
  for (let attempt = 1; attempt <= cloudRunPollAttempts; attempt++) {
    const revision = await json("gcloud", [
      "run",
      "revisions",
      "describe",
      revisionName,
      "--region",
      productionRegion,
    ])
    const ready = (revision.status?.conditions ?? []).find(
      (condition) => condition.type === "Ready",
    )
    const image = revision.spec?.containers?.[0]?.image ?? ""
    if (String(ready?.status).toLowerCase() === "true" && image.endsWith(`@${digest}`)) {
      return revision
    }
    if (String(ready?.status).toLowerCase() === "false") {
      throw new Error(`Replacement revision ${revisionName} reported Ready=False`)
    }
    if (attempt < cloudRunPollAttempts) {
      await new Promise((resolve) => setTimeout(resolve, cloudRunPollIntervalMs))
    }
  }
  throw new Error(
    `Replacement revision ${revisionName} did not become ready with the expected image`,
  )
}

async function waitForTraffic(revisionName) {
  for (let attempt = 1; attempt <= cloudRunPollAttempts; attempt++) {
    const service = await json("gcloud", [
      "run",
      "services",
      "describe",
      productionService,
      "--region",
      productionRegion,
    ])
    if (activeTraffic(service)?.revisionName === revisionName) return service
    if (attempt < cloudRunPollAttempts) {
      await new Promise((resolve) => setTimeout(resolve, cloudRunPollIntervalMs))
    }
  }
  throw new Error(`Cloud Run did not confirm 100% traffic on ${revisionName}`)
}

async function firebaseState(project) {
  const token = await run("gcloud", ["auth", "print-access-token"], { capture: true })
  const headers = { Authorization: `Bearer ${token}`, "x-goog-user-project": project }
  const sitesResponse = await fetch(
    `https://firebasehosting.googleapis.com/v1beta1/projects/${project}/sites`,
    { headers },
  )
  if (!sitesResponse.ok)
    throw new Error(`Firebase Hosting sites read failed: ${sitesResponse.status}`)
  const sites = (await sitesResponse.json()).sites ?? []
  if (sites.length !== 1)
    throw new Error(`Expected one Firebase Hosting site, found ${sites.length}`)
  const siteId = sites[0].name.split("/").at(-1)
  const releasesResponse = await fetch(
    `https://firebasehosting.googleapis.com/v1beta1/sites/${siteId}/releases?pageSize=1`,
    { headers },
  )
  if (!releasesResponse.ok)
    throw new Error(`Firebase Hosting release read failed: ${releasesResponse.status}`)
  const release = (await releasesResponse.json()).releases?.[0]
  if (!release?.version?.name) throw new Error("Firebase Hosting has no current release")
  const versionResponse = await fetch(
    `https://firebasehosting.googleapis.com/v1beta1/${release.version.name}`,
    { headers },
  )
  if (!versionResponse.ok)
    throw new Error(`Firebase Hosting version read failed: ${versionResponse.status}`)
  const version = await versionResponse.json()
  const rewriteMatches = (version.config?.rewrites ?? []).some(
    (rewrite) =>
      rewrite.glob === "**" &&
      rewrite.run?.serviceId === productionService &&
      rewrite.run?.region === productionRegion,
  )
  if (!rewriteMatches)
    throw new Error("Firebase Hosting does not have the expected Cloud Run rewrite")
  return { releaseType: release.type, siteFingerprint: fingerprint(siteId) }
}

async function inspectCloud() {
  const account = await run(
    "gcloud",
    ["auth", "list", "--filter=status:ACTIVE", "--format=value(account)"],
    {
      capture: true,
    },
  )
  const project = await run("gcloud", ["config", "get-value", "project"], { capture: true })
  if (!account || !project || project === "(unset)")
    throw new Error("Active gcloud account/project is missing")

  const service = await json("gcloud", [
    "run",
    "services",
    "describe",
    productionService,
    "--region",
    productionRegion,
  ])
  const current = activeTraffic(service)
  if (!current) throw new Error("Cannot identify the single 100% production revision")

  const iam = await json("gcloud", [
    "run",
    "services",
    "get-iam-policy",
    productionService,
    "--region",
    productionRegion,
  ])
  const publicInvoker = (iam.bindings ?? []).some(
    (binding) => binding.role === "roles/run.invoker" && binding.members?.includes("allUsers"),
  )
  if (!publicInvoker)
    throw new Error("Cloud Run public invoker policy differs from the known model")

  await run("gcloud", ["builds", "list", "--limit=1", "--format=value(status)"], { capture: true })
  const firebase = await firebaseState(project)
  const revisions = await json("gcloud", [
    "run",
    "revisions",
    "list",
    "--service",
    productionService,
    "--region",
    productionRegion,
  ])
  const zeroTraffic = (service.status?.traffic ?? []).filter((entry) => (entry.percent ?? 0) === 0)

  return {
    account,
    project,
    projectFingerprint: fingerprint(project),
    service,
    serviceUrl: service.status.url,
    currentRevision: current.revisionName,
    currentImage: revisions.find((revision) => revision.metadata?.name === current.revisionName)
      ?.spec?.containers?.[0]?.image,
    firebase,
    revisions,
    zeroTraffic,
  }
}

async function repositoryState() {
  const commit = await run("git", ["rev-parse", "HEAD"], { capture: true })
  const branch = await run("git", ["branch", "--show-current"], { capture: true })
  const status = await run("git", ["status", "--porcelain"], { capture: true })
  async function markdownFiles(directory) {
    const files = []
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const filePath = path.join(directory, entry.name)
      if (entry.isDirectory()) files.push(...(await markdownFiles(filePath)))
      else if (entry.name.endsWith(".md")) files.push(filePath)
    }
    return files
  }
  const numeric = (await markdownFiles(path.join(repositoryRoot, "content")))
    .map((file) =>
      path.relative(path.join(repositoryRoot, "content"), file).replaceAll(path.sep, "/"),
    )
    .map((relative) => /^(\d+)[-.]/.exec(relative)?.[1])
    .filter(Boolean)
    .map(Number)
  return {
    branch,
    commit,
    dirty: status.length > 0,
    dirtyEntries: status ? status.split(/\r?\n/) : [],
    highestSequence: Math.max(...numeric),
    blogArticles: numeric.length,
  }
}

async function runReleaseGates(includeCi) {
  if (includeCi) await run("npm", ["ci"])
  for (const [command, args] of releaseGates) await run(command, args)
  const tocPath = path.join(os.tmpdir(), `quartz-toc-${process.pid}.md`)
  try {
    const toc = await run(
      "node",
      ["scripts/audit-toc.mjs", "--public", "public", "--output", tocPath],
      { capture: true },
    )
    console.log(`\nTOC audit: ${toc}`)
    return JSON.parse(toc)
  } finally {
    await fs.rm(tocPath, { force: true })
  }
}

function releaseId(commit, dirty) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date())
  const value = (type) => parts.find((part) => part.type === type)?.value
  const stamp = `${value("year")}${value("month")}${value("day")}-${value("hour")}${value("minute")}${value("second")}`
  return `${stamp}-${commit.slice(0, 12)}${dirty ? "-dirty" : ""}`
}

async function confirm(prompt, expected) {
  if (!process.stdin.isTTY)
    throw new Error("Production confirmation requires an interactive terminal")
  const interface_ = readline.createInterface({ input: process.stdin, output: process.stdout })
  try {
    const answer = await interface_.question(`${prompt}\nType ${expected} to continue: `)
    if (answer.trim() !== expected) throw new Error("Deployment cancelled")
  } finally {
    interface_.close()
  }
}

async function writeRecord(record) {
  await fs.mkdir(privateLogRoot, { recursive: true })
  await fs.writeFile(
    path.join(privateLogRoot, `${record.releaseId}.json`),
    `${JSON.stringify(record, null, 2)}\n`,
  )
}

async function rollback(cloud, record) {
  console.error(`Restoring previous production revision ${cloud.currentRevision}...`)
  await run("gcloud", [
    "run",
    "services",
    "update-traffic",
    productionService,
    "--region",
    productionRegion,
    "--to-revisions",
    `${cloud.currentRevision}=100`,
  ])
  await waitForTraffic(cloud.currentRevision)
  const restored = await inspectCloud()
  if (restored.currentRevision !== cloud.currentRevision)
    throw new Error("Rollback traffic verification failed")
  const restoredHash = await sha256Url(productionOrigin)
  if (restoredHash !== record.previousHomepageHash)
    throw new Error("Rollback public homepage hash verification failed")
  record.rollback = { revision: cloud.currentRevision, verified: true }
  record.finalStatus = "FAILED_ROLLED_BACK"
  await writeRecord(record)
}

async function check() {
  const repository = await repositoryState()
  const cloud = await inspectCloud()
  console.log("\nDeployment target (read-only)")
  console.log(`Account: ${cloud.account}`)
  console.log(`Project: ${cloud.project} (fingerprint ${cloud.projectFingerprint})`)
  console.log(`Service/region: ${productionService} / ${productionRegion}`)
  console.log(`Current revision: ${cloud.currentRevision}`)
  console.log(`Firebase rewrite: PASS (site ${cloud.firebase.siteFingerprint})`)
  console.log(`Zero-traffic revisions: ${cloud.zeroTraffic.length}`)
  console.log(
    `Source: ${repository.commit} on ${repository.branch}${repository.dirty ? " (DIRTY)" : ""}`,
  )
  console.log(
    `Blog Articles: ${repository.blogArticles}; highest sequence: ${repository.highestSequence}`,
  )
  if (repository.dirty)
    console.log("Working tree policy: production will require an explicit dirty-tree override")
  const toc = await runReleaseGates(false)
  console.log(`TOC expected/rendered: ${toc.expected}/${toc.rendered}`)
  console.log("\ndeploy:check PASS — no cloud state was changed.")
}

async function production() {
  const repository = await repositoryState()
  const cloud = await inspectCloud()
  const release = releaseId(repository.commit, repository.dirty)
  const image = `gcr.io/${cloud.project}/${productionService}:${release}`
  const replacementRevision = replacementRevisionName(release)
  const record = {
    timestamp: new Date().toISOString(),
    releaseId: release,
    sourceCommit: repository.commit,
    dirty: repository.dirty,
    dirtyEntries: repository.dirtyEntries,
    projectFingerprint: cloud.projectFingerprint,
    previousProductionRevision: cloud.currentRevision,
    previousImage: cloud.currentImage,
    previousHomepageHash: await sha256Url(productionOrigin),
    finalStatus: "PREPARING",
  }
  await writeRecord(record)

  console.log("\nProduction Deployment")
  console.log(
    `Source commit: ${repository.commit}${repository.dirty ? " (explicit dirty override)" : ""}`,
  )
  console.log(`Release: ${release}`)
  console.log(`Blog Articles: ${repository.blogArticles}`)
  console.log(`Highest sequence: ${repository.highestSequence}`)
  console.log(`Current revision: ${cloud.currentRevision}`)
  console.log(
    "Action: build one immutable image, safely replace the current Cloud Run revision, then smoke-test",
  )
  console.log(`Automatic failure recovery: restore ${cloud.currentRevision}`)
  if (repository.dirty)
    await confirm("This source state is not reproducible from the current commit.", "DEPLOY DIRTY")
  await confirm(
    "Confirm the account/project/service shown above and start the production release.",
    release,
  )

  const toc = await runReleaseGates(true)
  record.toc = { expected: toc.expected, rendered: toc.rendered }
  record.preDeploymentValidation = "PASS"
  await writeRecord(record)

  await confirm(
    `Warm a normal browser against ${productionOrigin}, use Search once, and leave that browser profile intact.`,
    "WARMED",
  )

  await run("gcloud", ["builds", "submit", "--tag", image, "."])
  const digest = await run(
    "gcloud",
    ["container", "images", "describe", image, "--format=value(image_summary.digest)"],
    { capture: true },
  )
  record.image = image
  record.imageDigest = digest
  record.finalStatus = "IMAGE_BUILT"
  await writeRecord(record)

  let productionTrafficChanged = false
  try {
    await run("gcloud", [
      "run",
      "deploy",
      productionService,
      "--image",
      `${image}@${digest}`,
      "--platform",
      "managed",
      "--region",
      productionRegion,
      "--port",
      "8080",
      "--revision-suffix",
      replacementRevision.slice(productionService.length + 1),
      "--no-traffic",
      "--quiet",
    ])
    await waitForRevisionReady(replacementRevision, digest)
    record.replacementRevision = replacementRevision
    record.finalStatus = "REPLACEMENT_READY"
    await writeRecord(record)

    await run("gcloud", [
      "run",
      "services",
      "update-traffic",
      productionService,
      "--region",
      productionRegion,
      "--to-revisions",
      `${replacementRevision}=100`,
    ])
    productionTrafficChanged = true
    await waitForTraffic(replacementRevision)
    const deployed = await inspectCloud()
    if (deployed.currentRevision !== replacementRevision) {
      throw new Error("Cloud Run traffic did not move to the ready replacement")
    }

    await run("npm", ["run", "validate:caddy", "--", deployed.serviceUrl])
    await run("npm", ["run", "validate:live", "--", deployed.serviceUrl])
    await run("npm", ["run", "validate:caddy", "--", productionOrigin])
    await run("npm", ["run", "validate:live", "--", productionOrigin])
    record.automatedProductionValidation = "PASS"
    await writeRecord(record)

    await confirm(
      "In a fresh/private browser, verify Search, Theme, newest article, mobile layout, 404, and no console errors.",
      "FRESH PASS",
    )
    await confirm(
      "In the browser warmed before deployment, reload normally, Search again, open a result, and verify HTTP 200.",
      "WARM PASS",
    )
    record.freshClientValidation = "PASS"
    record.warmClientValidation = "PASS"
    record.finalStatus = "PASS"
    await writeRecord(record)
    console.log(`\nDeployment PASS. One production revision serves ${productionOrigin}.`)
    console.log(`Evidence: private/deployments/${release}.json`)
    console.log("Obsolete revisions/images remain untouched pending an explicit cleanup decision.")
  } catch (error) {
    if (productionTrafficChanged) await rollback(cloud, record)
    throw error
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  try {
    if (mode === "check") await check()
    else if (mode === "production") await production()
    else throw new Error(`Unknown deployment mode: ${mode}`)
  } catch (error) {
    console.error(`\nDEPLOYMENT FAILED: ${error.message}`)
    process.exitCode = 1
  }
}
