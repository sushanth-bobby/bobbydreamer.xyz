export interface SequenceEntry {
  slug?: string
  slugSegment?: string
}

export function getArticleSequence(entry: SequenceEntry | string | undefined): number | undefined {
  const slug = typeof entry === "string" ? entry : (entry?.slugSegment ?? entry?.slug ?? "")
  const match = /^(\d+)(?:[-.])/.exec(slug)
  return match ? Number(match[1]) : undefined
}

/** Canonical numbered-article order: sequence descending, then structural slug ascending. */
export function compareArticleSequence(a: SequenceEntry, b: SequenceEntry): number {
  const aSlug = a.slugSegment ?? a.slug ?? ""
  const bSlug = b.slugSegment ?? b.slug ?? ""
  const aMatch = /^(\d+)(?:[-.])/.exec(aSlug)
  const bMatch = /^(\d+)(?:[-.])/.exec(bSlug)
  const aSequence = aMatch ? Number(aMatch[1]) : undefined
  const bSequence = bMatch ? Number(bMatch[1]) : undefined

  if (aSequence !== undefined && bSequence !== undefined) {
    return (
      bSequence - aSequence ||
      aSlug.localeCompare(bSlug, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    )
  }
  if (aSequence === undefined && bSequence !== undefined) return -1
  if (aSequence !== undefined && bSequence === undefined) return 1
  return aSlug.localeCompare(bSlug, undefined, { numeric: true, sensitivity: "base" })
}

export function isNumberedArticle(entry: SequenceEntry | string | undefined): boolean {
  return getArticleSequence(entry) !== undefined
}
