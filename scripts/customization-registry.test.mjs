import assert from "node:assert/strict"
import { test } from "node:test"
import path from "node:path"
import {
  readCustomizationEvidence,
  validateCustomizationEvidence,
} from "./customization-registry.mjs"

const repositoryRoot = path.resolve(import.meta.dirname, "..")
const evidence = await readCustomizationEvidence(repositoryRoot)

test("customization IDs and ownership records are complete and one-to-one", () => {
  const result = validateCustomizationEvidence(evidence)
  assert.deepEqual(result, { customizations: 22, ownershipRecords: 22 })
})

test("every customization documents purpose, implementation, tests, risk, and upgrade proof", () => {
  for (const { id } of evidence.manifest.customizations) {
    const start = evidence.customizations.indexOf(`### ${id}`)
    const end = evidence.customizations.indexOf("\n### QZ-CUST-", start + 1)
    const section = evidence.customizations.slice(start, end >= 0 ? end : undefined)
    assert.match(section, /Purpose \/ user requirement:/)
    assert.match(section, /Implementation location:/)
    assert.match(section, /Tests protecting it:/)
    assert.match(section, /How to validate after upgrade:/)
  }
})

test("media ownership keeps processing independent from the Quartz adapter", () => {
  assert.match(
    evidence.customizations,
    /Source image[\s\S]*filesystem cache[\s\S]*@bdv\/quartz-media/,
  )
  assert.match(evidence.customizations, /Only `quartz-media`[\s\S]*may need adaptation/i)
})

test("the maintenance runbook requires approval and prohibits automatic upgrades", () => {
  assert.match(evidence.runbook, /explicit user approval/i)
  assert.match(evidence.runbook, /Automatic Quartz upgrades/i)
  assert.equal(evidence.manifest.upgradePolicy.approvalRequired, true)
  assert.equal(evidence.manifest.upgradePolicy.automaticQuartzUpgrades, false)
})
