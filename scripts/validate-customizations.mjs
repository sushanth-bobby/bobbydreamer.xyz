import path from "node:path"
import {
  readCustomizationEvidence,
  validateCustomizationEvidence,
} from "./customization-registry.mjs"

const repositoryRoot = path.resolve(import.meta.dirname, "..")
const result = validateCustomizationEvidence(await readCustomizationEvidence(repositoryRoot))

console.log(
  `Customization registry validation passed: ${result.customizations} detailed records and ${result.ownershipRecords} ownership records.`,
)
