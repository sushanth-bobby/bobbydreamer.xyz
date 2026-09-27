import { createHash } from "node:crypto"

const base = new URL(process.argv[2] ?? "http://localhost:8080")
const failures = []

function fail(message) {
  failures.push(message)
}

async function get(pathname, expectedStatus = 200) {
  const response = await fetch(new URL(pathname, base), { redirect: "manual" })
  if (response.status !== expectedStatus) {
    fail(`${pathname}: expected ${expectedStatus}, received ${response.status}`)
  }
  return response
}

const homeResponse = await get("/")
const home = await homeResponse.text()
const canonical = /<link rel="canonical" href="([^"]+)"/.exec(home)?.[1]
const ogUrl = /<meta property="og:url" content="([^"]+)"/.exec(home)?.[1]
const twitterUrl = /<meta property="twitter:url" content="([^"]+)"/.exec(home)?.[1]
if (!canonical || canonical !== ogUrl || canonical !== twitterUrl) {
  fail("homepage canonical, OpenGraph, and Twitter URLs do not agree")
}

const indexName = /contentIndex-([0-9a-f]{16})\.json/.exec(home)?.[0]
if (!indexName) fail("homepage does not reference a content-addressed Search index")

if (indexName) {
  const indexResponse = await get(`/static/${indexName}`)
  const cacheControl = indexResponse.headers.get("cache-control") ?? ""
  if (!/max-age=31536000/.test(cacheControl) || !/immutable/.test(cacheControl)) {
    fail(`content index has unsafe Cache-Control: ${cacheControl || "<missing>"}`)
  }
  const bytes = Buffer.from(await indexResponse.arrayBuffer())
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16)
  if (indexName !== `contentIndex-${hash}.json`) {
    fail("content index URL does not match the response content hash")
  }

  const index = JSON.parse(bytes.toString("utf8"))
  const firebaseResult = Object.keys(index).find((slug) =>
    `${index[slug]?.title ?? ""} ${index[slug]?.content ?? ""}`
      .toLowerCase()
      .includes("firebase rules"),
  )
  if (!firebaseResult) {
    fail("Search index does not contain the Firebase Rules regression query")
  } else {
    const route = firebaseResult.endsWith("/index")
      ? `/${firebaseResult.slice(0, -"/index".length)}/`
      : `/${firebaseResult}`
    await get(route)
  }
}

const stableIndex = await get("/static/contentIndex.json", 404)
if (!/no-cache/.test(stableIndex.headers.get("cache-control") ?? "")) {
  fail("removed stable index response is not revalidated")
}

for (const pathname of ["/", "/index.xml", "/sitemap.xml", "/robots.txt", "/static/icon.png"]) {
  const response = pathname === "/" ? homeResponse : await get(pathname)
  if (!/no-cache/.test(response.headers.get("cache-control") ?? "")) {
    fail(`${pathname}: stable resource is not cache-revalidated`)
  }
}

const hashedResource = /(?:href|src)="(?:\.\.\/|\.\/)*([^"/]+-[0-9a-f]{8}\.(?:css|js))"/.exec(
  home,
)?.[1]
if (!hashedResource) {
  fail("homepage does not reference a hashed JS/CSS resource")
} else {
  const response = await get(`/${hashedResource}`)
  const cacheControl = response.headers.get("cache-control") ?? ""
  if (!/max-age=31536000/.test(cacheControl) || !/immutable/.test(cacheControl)) {
    fail(`${hashedResource}: content-hashed resource is not immutable`)
  }
}

const notFound = await get("/phase51-release-validation-not-found", 404)
const notFoundHtml = await notFound.text()
if (!/<meta name="robots" content="noindex"/.test(notFoundHtml)) {
  fail("404 response is missing noindex")
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`)
  process.exitCode = 1
} else {
  console.log(`Live release contract passed against ${base.origin}:`)
  console.log(`- Search/Graph index ${indexName} is content-addressed and immutable`)
  console.log("- stable resources revalidate and the removed stable index returns 404")
  console.log("- Search regression result resolves, metadata agrees, and 404 is noindex")
}
