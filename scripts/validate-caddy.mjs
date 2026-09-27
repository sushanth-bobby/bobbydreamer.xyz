const base = new URL(process.argv[2] ?? "http://localhost:8080")
const failures = []

async function check(pathname, expectedStatus, expectedLocation) {
  const response = await fetch(new URL(pathname, base), { redirect: "manual" })
  if (response.status !== expectedStatus) {
    failures.push(`${pathname}: expected ${expectedStatus}, received ${response.status}`)
  }
  if (expectedLocation !== undefined) {
    const actual = response.headers.get("location")
    if (actual !== expectedLocation) {
      failures.push(`${pathname}: expected Location ${expectedLocation}, received ${actual}`)
    }
  }
}

await check("/", 200)
await check(
  "/152-customizing-quartz5-for-bobbydreamerxyz",
  308,
  "/152-customizing-quartz5-for-bobbydreamerxyz/",
)
await check("/152-customizing-quartz5-for-bobbydreamerxyz/", 200)
await check("/19.changing-gatsby-colors-manually", 308, "/19.changing-gatsby-colors-manually/")
await check("/19.changing-gatsby-colors-manually/", 200)
await check("/19.changing-gatsby-colors-manually/darkmode4.png", 200)
await check("/changing-gatsby-colors-manually", 200)
await check("/changing-gatsby-colors-manually/", 308, "/changing-gatsby-colors-manually")
await check("/pages/about_me", 200)
await check("/pages/about_me/", 308, "/pages/about_me")
await check("/blog", 308, "/blog/")
await check("/blog/", 200)
await check("/blog/2026", 308, "/blog/2026/")
await check("/blog/2026/", 200)
await check("/topics/", 200)
await check("/tags/python", 200)
await check("/static/brand/bobbydreamer-mark.png", 200)
await check("/favicon.ico", 200)
await check("/robots.txt", 200)
await check("/does-not-exist", 404)
await check(
  "/19.changing-gatsby-colors-manually?ref=test",
  308,
  "/19.changing-gatsby-colors-manually/?ref=test",
)
await check(
  "/changing-gatsby-colors-manually/?ref=test",
  308,
  "/changing-gatsby-colors-manually?ref=test",
)

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`)
  process.exitCode = 1
} else {
  console.log(`Caddy route matrix passed against ${base.origin}.`)
}
