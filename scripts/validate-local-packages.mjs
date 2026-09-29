import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { build } from "esbuild"

const repositoryRoot = path.resolve(import.meta.dirname, "..")
const packages = {
  "quartz-content-context": ["index.ts", "components.tsx"],
  "quartz-ia-article-nav": ["index.ts", "components.tsx"],
  "quartz-ia-articles": ["index.ts"],
  "quartz-ia-header": ["index.ts", "components.tsx"],
  "quartz-ia-pages": ["index.tsx"],
  "quartz-ia-properties": ["index.ts", "components.tsx"],
  "quartz-media": ["index.ts"],
}

const normalize = (value) => value.replaceAll("\r\n", "\n")
const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "bdv-quartz-package-parity-"))
let compared = 0

try {
  for (const [packageName, entryPoints] of Object.entries(packages)) {
    const packageRoot = path.join(repositoryRoot, packageName)
    const result = await build({
      absWorkingDir: packageRoot,
      entryPoints,
      bundle: true,
      platform: "node",
      format: "esm",
      outdir: path.join(temporaryRoot, packageName),
      external: ["preact*", "@quartz-community/*"],
      write: false,
    })

    for (const output of result.outputFiles) {
      const outputName = path.basename(output.path)
      const checkedIn = await fs.readFile(path.join(packageRoot, "dist", outputName), "utf8")
      const rebuilt = new TextDecoder().decode(output.contents)
      if (normalize(checkedIn) !== normalize(rebuilt)) {
        throw new Error(`${packageName}/dist/${outputName} differs from its source rebuild`)
      }
      compared += 1
    }
  }

  console.log(`Local package parity: ${compared} generated entry points match source.`)
} finally {
  await fs.rm(temporaryRoot, { recursive: true, force: true })
}
