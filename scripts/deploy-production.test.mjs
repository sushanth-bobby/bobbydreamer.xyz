import assert from "node:assert/strict"
import fs from "node:fs"
import { test } from "node:test"
import { deploymentPlan, releaseGates, replacementRevisionName } from "./deploy-production.mjs"

const joined = ([command, args]) => `${command} ${args.join(" ")}`

test("deploy:check is read-only", () => {
  for (const entry of deploymentPlan("check")) {
    assert.doesNotMatch(
      joined(entry),
      /builds submit|run deploy|update-traffic|add-iam-policy-binding|firebase deploy|\bdelete\b/,
    )
  }
})

test("release gates finish before build, safe replacement, and traffic change", () => {
  const commands = deploymentPlan("production").map(joined)
  const lastGate = commands.indexOf(joined(releaseGates.at(-1)))
  const build = commands.findIndex((command) => command.includes("builds submit"))
  const deploy = commands.findIndex((command) => command.includes("run deploy"))
  const traffic = commands.findIndex((command) => command.includes("update-traffic"))
  assert.ok(lastGate >= 0 && lastGate < build)
  assert.ok(build < deploy && deploy < traffic)
  assert.match(commands[traffic], /--to-revisions/)
  assert.doesNotMatch(commands[traffic], /--to-latest/)
})

test("replacement traffic targets the deterministic revision rather than a stale latest pointer", () => {
  assert.equal(
    replacementRevisionName("20260927-130000-abcdef123456"),
    "bdxyz-p51-20260927-130000-abcdef123456",
  )
  const deployment = fs.readFileSync("scripts/deploy-production.mjs", "utf8")
  assert.match(deployment, /waitForRevisionReady\(replacementRevision, digest\)/)
  assert.match(deployment, /waitForTraffic\(replacementRevision\)/)
  assert.match(deployment, /`\$\{replacementRevision\}=100`/)
  assert.doesNotMatch(deployment, /readyService\.status\?\.latestReadyRevisionName/)
})

test("deployment captures rollback state and never embeds the operational project", () => {
  const deployment = fs.readFileSync("scripts/deploy-production.mjs", "utf8")
  assert.match(deployment, /currentRevision: current\.revisionName/)
  assert.match(deployment, /--no-traffic/)
  assert.match(deployment, /if \(productionTrafficChanged\) await rollback/)
  assert.match(deployment, /previousHomepageHash/)
  assert.doesNotMatch(deployment, /npx quartz/)
  assert.doesNotMatch(deployment, /bdxyz-\d{4,}/)
})
