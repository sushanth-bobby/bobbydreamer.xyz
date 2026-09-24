import type { QuartzPluginData } from "./quartz/plugins/vfile"
import {
  compareArticleSequence,
  getArticleSequence,
  isNumberedArticle,
} from "./quartz.explorer-order"

export type PageClass = "home" | "article" | "til" | "static" | "archive" | "topic" | "other"

type PageIdentity = Pick<QuartzPluginData, "slug" | "frontmatter">

const nonArticleRoutes =
  /^(?:(?:index|til(?:\/index)?|bio(?:\/index)?|irevere(?:\/index)?|music(?:\/index)?)$|(?:blog|topics|tags)(?:\/|$))/

/**
 * A Blog Article is authored content with a publication date outside the site's
 * reserved non-article routes. Numeric path prefixes remain a separate ordering
 * concern handled by quartz.explorer-order.ts.
 */
export function isBlogArticle(file: PageIdentity): boolean {
  const slug = file.slug ?? ""
  return !nonArticleRoutes.test(slug) && frontmatterDate(file as QuartzPluginData) !== undefined
}

export function classifyPage(file: PageIdentity): PageClass {
  const value = file.slug ?? ""
  if (value === "index" || value === "") return "home"
  if (value === "til/index" || value === "til") return "til"
  if (/^(?:bio|irevere|music)(?:\/index)?$/.test(value)) return "static"
  if (/^(?:blog|topics)(?:\/|$)/.test(value)) return "archive"
  if (/^tags(?:\/|$)/.test(value)) return "topic"
  if (isBlogArticle(file)) return "article"
  return "other"
}

export function numberedArticles<T extends { slug?: string }>(files: T[]): T[] {
  return files.filter((file) => isNumberedArticle(file)).sort(compareArticleSequence)
}

export function frontmatterDate(file: QuartzPluginData): Date | undefined {
  const raw = (file.frontmatter as Record<string, unknown> | undefined)?.date
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw
  if (typeof raw === "string" || typeof raw === "number") {
    const parsed = new Date(raw)
    if (!Number.isNaN(parsed.getTime())) return parsed
  }
  return undefined
}

export function archiveYears(files: QuartzPluginData[]): number[] {
  return [
    ...new Set(
      numberedArticles(files)
        .map(frontmatterDate)
        .filter((date): date is Date => !!date)
        .map((date) => date.getUTCFullYear()),
    ),
  ].sort((a, b) => b - a)
}

export function articlesForYear(files: QuartzPluginData[], year: number): QuartzPluginData[] {
  return numberedArticles(files)
    .filter((file) => frontmatterDate(file)?.getUTCFullYear() === year)
    .sort((a, b) => {
      const dateDifference =
        (frontmatterDate(b)?.getTime() ?? 0) - (frontmatterDate(a)?.getTime() ?? 0)
      return dateDifference || compareArticleSequence(a, b)
    })
}

export function articleNeighbors(files: QuartzPluginData[], slug: string | undefined) {
  if (!slug || getArticleSequence(slug) === undefined) return undefined
  const ordered = numberedArticles(files)
  const index = ordered.findIndex((file) => file.slug === slug)
  if (index < 0) return undefined
  return {
    previous: ordered[index + 1],
    next: ordered[index - 1],
  }
}

export const quartz4CompatibilityRoutes = {
  "pages/about_me": "bio/",
  "pages/irevere": "irevere/",
  "pages/til": "til/",
} as const
