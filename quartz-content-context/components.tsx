import type { QuartzComponent, QuartzComponentConstructor } from "../quartz/components/types"
import style from "./style"

export type ContentStatus = "current" | "historical" | "superseded" | "point-in-time"
export type LearningArchiveContext = "gatsby" | "google-domains" | "gsutil"

export const contentStatusMessages: Record<Exclude<ContentStatus, "current">, string> = {
  historical:
    "This article reflects my experience with the technologies and versions available when it was written. Some technical details may have changed since then.",
  superseded:
    "A newer article or approach replaces this one. This version remains available as part of the site's historical record.",
  "point-in-time":
    "This article records observations, decisions, or circumstances at the time it was written.",
}

export const learningArchiveContextMessages: Record<LearningArchiveContext, string> = {
  gatsby: "This article documents the site's Gatsby era; the site now runs on Quartz.",
  "google-domains":
    "Google Domains has since migrated to Squarespace. The instructions here reflect the service as it existed at the time and are retained for historical reference.",
  gsutil:
    "This article uses the legacy gsutil Cloud Storage CLI; current Google Cloud guidance uses gcloud storage. The original commands are retained for historical reference.",
}

type ArticleContextData = {
  status: ContentStatus
  authorship: "user" | "ai"
  supersededBy?: string
  learningArchiveContexts: LearningArchiveContext[]
}

export function getArticleContext(
  frontmatter: Record<string, unknown> | undefined,
): ArticleContextData {
  const rawStatus = frontmatter?.status
  const status: ContentStatus =
    rawStatus === "historical" || rawStatus === "superseded" || rawStatus === "point-in-time"
      ? rawStatus
      : "current"
  const authorship = frontmatter?.authorship === "ai" ? "ai" : "user"
  const supersededBy =
    typeof frontmatter?.supersededBy === "string" && frontmatter.supersededBy.trim() !== ""
      ? frontmatter.supersededBy
      : undefined
  const rawContexts = Array.isArray(frontmatter?.learningArchiveContexts)
    ? frontmatter.learningArchiveContexts
    : []
  const learningArchiveContexts = rawContexts.filter(
    (context): context is LearningArchiveContext =>
      context === "gatsby" || context === "google-domains" || context === "gsutil",
  )
  return { status, authorship, supersededBy, learningArchiveContexts }
}

export const ArticleContext: QuartzComponentConstructor = () => {
  const Context: QuartzComponent = ({ fileData }) => {
    const data = getArticleContext(fileData.frontmatter as Record<string, unknown> | undefined)
    if (data.status === "current" && data.authorship === "user") return null

    return (
      <aside class="article-context" aria-label="Article context">
        {data.authorship === "ai" && <p class="article-authorship">Written by AI</p>}
        {data.status !== "current" && (
          <div class={`content-status-notice content-status-${data.status}`}>
            <strong>
              {data.status === "historical"
                ? "Learning archive"
                : data.status === "superseded"
                  ? "Superseded article"
                  : "Point-in-time journal"}
            </strong>
            <span>{contentStatusMessages[data.status]}</span>
            {data.status === "historical" && data.learningArchiveContexts.length > 0 && (
              <div class="learning-archive-details">
                <span>Also note:</span>
                <ul>
                  {data.learningArchiveContexts.map((context) => (
                    <li>
                      {context === "gsutil" ? (
                        <>
                          This article uses the legacy <code>gsutil</code> Cloud Storage CLI;
                          current Google Cloud guidance uses <code>gcloud storage</code>. The
                          original commands are retained for historical reference.
                        </>
                      ) : (
                        learningArchiveContextMessages[context]
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.status === "superseded" && data.supersededBy && (
              <a class="internal" href={data.supersededBy}>
                Read the successor article →
              </a>
            )}
          </div>
        )}
      </aside>
    )
  }

  Context.css = style
  return Context
}

export default ArticleContext
