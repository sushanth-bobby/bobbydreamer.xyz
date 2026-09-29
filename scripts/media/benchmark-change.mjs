import { spawn } from "node:child_process"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import sharp from "sharp"

const repositoryRoot = path.resolve(import.meta.dirname, "..", "..")
const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "bdv-media-change-benchmark-"))
const excluded = new Set([".git", ".quartz-cache", "node_modules", "private", "public"])

async function copyRepository() {
  await fs.cp(repositoryRoot, temporaryRoot, {
    recursive: true,
    filter(source) {
      if (source === repositoryRoot) return true
      const relative = path.relative(repositoryRoot, source)
      return !excluded.has(relative.split(path.sep)[0])
    },
  })
  await fs.symlink(
    path.join(repositoryRoot, "node_modules"),
    path.join(temporaryRoot, "node_modules"),
    "junction",
  )
}

async function runBuild() {
  const executable = process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : "npm"
  const args = process.platform === "win32" ? ["/d", "/c", "npm", "run", "build"] : ["run", "build"]
  const started = performance.now()
  await new Promise((resolve, reject) => {
    const child = spawn(executable, args, { cwd: temporaryRoot, shell: false, stdio: "inherit" })
    child.on("error", reject)
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`benchmark build failed (${code})`)),
    )
  })
  return Math.round((performance.now() - started) * 100) / 100
}

try {
  await copyRepository()
  const representative = path.join(
    temporaryRoot,
    "content",
    "70-qfw-aswath-damodaran",
    "uber-business-model.png",
  )
  const changedPath = `${representative}.changed.png`
  await sharp(representative)
    .composite([
      {
        input: { create: { width: 1, height: 1, channels: 4, background: "#92533f" } },
        left: 0,
        top: 0,
      },
    ])
    .png()
    .toFile(changedPath)
  await fs.rename(changedPath, representative)
  const totalBuildMs = await runBuild()
  const media = JSON.parse(
    await fs.readFile(path.join(temporaryRoot, "generated", "media-last-run.json"), "utf8"),
  )
  console.log(
    JSON.stringify(
      {
        case: "single-image-change",
        source: "content/70-qfw-aswath-damodaran/uber-business-model.png",
        totalBuildMs,
        media,
      },
      null,
      2,
    ),
  )
} finally {
  await fs.rm(temporaryRoot, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}
