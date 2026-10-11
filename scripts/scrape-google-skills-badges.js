import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const fs = require("fs/promises")
const path = require("path")
const { chromium } = require("playwright")
const sharp = require("sharp")
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PROFILE_URL =
  "https://www.skills.google/public_profiles/ce5ee3f8-a0e8-4f4c-b6f8-2f4dc8fb948d?locale=en"
const OUTPUT_DIR = path.resolve(
  __dirname,
  "../content/154-google-cloud-skills-journey",
)

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72)
}

function csvCell(value) {
  return `"${String(value).replace(/"/g, '""')}"`
}

async function buildContactSheets(items) {
  const columns = 3
  const rows = 4
  const tileWidth = 390
  const tileHeight = 500
  const gap = 24
  const padding = 32
  const perSheet = columns * rows

  for (let offset = 0; offset < items.length; offset += perSheet) {
    const group = items.slice(offset, offset + perSheet)
    const composites = []

    for (let i = 0; i < group.length; i += 1) {
      const screenshotPath = path.join(OUTPUT_DIR, group[i].screenshot)
      const input = await sharp(screenshotPath)
        .resize({
          width: tileWidth,
          height: tileHeight,
          fit: "contain",
          background: "#ffffff",
        })
        .jpeg({ quality: 90 })
        .toBuffer()
      const col = i % columns
      const row = Math.floor(i / columns)
      composites.push({
        input,
        left: padding + col * (tileWidth + gap),
        top: padding + row * (tileHeight + gap),
      })
    }

    const sheetNumber = Math.floor(offset / perSheet) + 1
    const outputPath = path.join(
      OUTPUT_DIR,
      `contact-sheet-${String(sheetNumber).padStart(2, "0")}.jpg`,
    )
    await sharp({
      create: {
        width: padding * 2 + columns * tileWidth + (columns - 1) * gap,
        height: padding * 2 + rows * tileHeight + (rows - 1) * gap,
        channels: 3,
        background: "#f4f7fb",
      },
    })
      .composite(composites)
      .jpeg({ quality: 90 })
      .toFile(outputPath)
  }
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  })

  try {
    const page = await browser.newPage({
      viewport: { width: 1400, height: 1000 },
      deviceScaleFactor: 1,
    })
    await page.goto(PROFILE_URL, { waitUntil: "networkidle", timeout: 120000 })
    await page.locator(".profile-badge").first().waitFor({
      state: "visible",
      timeout: 30000,
    })
    await page.waitForFunction(() =>
      [...document.images].every((image) => image.complete),
    )

    const cards = page.locator(".profile-badge")
    const count = await cards.count()
    if (count !== 48) {
      throw new Error(`Expected 48 badge cards, found ${count}`)
    }

    const items = []
    for (let index = 0; index < count; index += 1) {
      const card = cards.nth(index)
      const data = await card.evaluate((element) => {
        const link = element.querySelector('a[href*="/badges/"]')
        const title = element.querySelector(".ql-title-medium")
        const earned = element.querySelector(".ql-body-medium")
        const image = element.querySelector("img")
        return {
          title: title?.textContent?.replace(/\s+/g, " ").trim() || "",
          earned: earned?.textContent?.replace(/\s+/g, " ").trim() || "",
          href: link?.href || "",
          imageSource: image?.currentSrc || image?.src || "",
        }
      })
      const badgeId = data.href.split("/").filter(Boolean).pop()
      const filename = `${String(index + 1).padStart(2, "0")}-${slugify(data.title)}.jpg`
      await card.screenshot({
        path: path.join(OUTPUT_DIR, filename),
        type: "jpeg",
        quality: 92,
      })
      items.push({
        index: index + 1,
        badgeId,
        title: data.title,
        earned: data.earned.replace(/^Earned\s+/i, ""),
        earnedLabel: data.earned,
        badgeUrl: data.href,
        imageSource: data.imageSource,
        screenshot: filename,
      })
      process.stdout.write(`Captured ${index + 1}/48: ${data.title}\n`)
    }

    await fs.writeFile(
      path.join(OUTPUT_DIR, "badges.json"),
      `${JSON.stringify(
        {
          source: PROFILE_URL,
          profileName: "Sushanth Bobby Lloyds",
          badgeCount: items.length,
          scrapedAt: new Date().toISOString(),
          badges: items,
        },
        null,
        2,
      )}\n`,
      "utf8",
    )

    const headers = [
      "index",
      "badge_id",
      "title",
      "earned",
      "badge_url",
      "image_source",
      "screenshot",
    ]
    const rows = items.map((item) =>
      [
        item.index,
        item.badgeId,
        item.title,
        item.earned,
        item.badgeUrl,
        item.imageSource,
        item.screenshot,
      ]
        .map(csvCell)
        .join(","),
    )
    await fs.writeFile(
      path.join(OUTPUT_DIR, "badges.csv"),
      `${headers.join(",")}\n${rows.join("\n")}\n`,
      "utf8",
    )

    await buildContactSheets(items)
    process.stdout.write(`Saved ${items.length} badge screenshots to ${OUTPUT_DIR}\n`)
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
