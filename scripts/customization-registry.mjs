import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"

const requiredDetailLabels = [
  "Purpose / user requirement:",
  "Stock Quartz behavior:",
  "Implementation location:",
  "Tests protecting it:",
  "Upgrade risk:",
  "How to validate after upgrade:",
]

export async function readCustomizationEvidence(repositoryRoot) {
  const read = (file) => readFile(path.join(repositoryRoot, file), "utf8")
  const [manifestText, customizations, registry, contract, runbook] = await Promise.all([
    read("quartz-customizations.json"),
    read("CUSTOMIZATIONS.md"),
    read("CUSTOMIZATION_REGISTRY.md"),
    read("SITE_CONTRACT.md"),
    read("QUARTZ_UPGRADE.md"),
  ])

  return {
    manifest: JSON.parse(manifestText),
    customizations,
    registry,
    contract,
    runbook,
  }
}

export function validateCustomizationEvidence(evidence) {
  const { manifest, customizations, registry, contract, runbook } = evidence
  assert.equal(manifest.schemaVersion, 2)
  assert.equal(manifest.coreImplementationModifications, 0)
  assert.equal(manifest.upgradePolicy?.approvalRequired, true)
  assert.equal(manifest.upgradePolicy?.automaticQuartzUpgrades, false)
  assert.equal(manifest.upgradePolicy?.automaticDependencyMerging, false)

  const items = manifest.customizations ?? []
  const ids = items.map(({ id }) => id)
  assert.equal(items.length, 22)
  assert.equal(new Set(ids).size, items.length)
  assert.deepEqual(
    ids,
    Array.from({ length: 22 }, (_, index) => `QZ-CUST-${String(index + 1).padStart(3, "0")}`),
  )

  const ownershipIds = Object.keys(manifest.ownershipRegistry ?? {})
  assert.deepEqual(ownershipIds, ids)

  for (const item of items) {
    assert.match(item.name, /\S/)
    assert.ok(item.files?.length > 0, `${item.id} must list implementation files`)
    assert.ok(item.tests?.length > 0, `${item.id} must list protecting tests`)
    assert.match(item.upgradeRisk, /^(LOW|MEDIUM|HIGH)$/)

    const ownership = manifest.ownershipRegistry[item.id]
    assert.match(ownership.owner, /\S/)
    assert.match(ownership.quartzCoupling, /\S/)
    assert.match(ownership.verification, /\S/)
    assert.match(registry, new RegExp(`\\| ${item.id} \\|`))

    const start = customizations.indexOf(`### ${item.id}`)
    const end = customizations.indexOf("\n### QZ-CUST-", start + 1)
    assert.ok(start >= 0, `${item.id} needs a detailed CUSTOMIZATIONS.md section`)
    const section = customizations.slice(start, end >= 0 ? end : undefined)
    for (const label of requiredDetailLabels) {
      assert.ok(section.includes(label), `${item.id} is missing ${label}`)
    }
  }

  assert.match(customizations, /Source image[\s\S]*SHA-256 identity[\s\S]*@bdv\/quartz-media/)
  assert.match(customizations, /Only `quartz-media`[\s\S]*may need adaptation/i)
  assert.match(contract, /npm run validate:upgrade/)
  assert.match(contract, /1440×900[\s\S]*900×900[\s\S]*390×844/)
  assert.match(runbook, /explicit user approval/i)
  assert.match(runbook, /automatic Quartz upgrades/i)

  return { customizations: items.length, ownershipRecords: ownershipIds.length }
}
