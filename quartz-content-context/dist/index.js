// style.ts
var style = `
.article-context {
  margin: 0 0 1.5rem;
}
.article-authorship {
  display: inline-flex;
  margin: 0 0 0.65rem;
  padding: 0.24rem 0.58rem;
  border: 1px solid color-mix(in srgb, var(--tertiary) 38%, var(--lightgray));
  border-radius: 999px;
  background: color-mix(in srgb, var(--tertiary) 10%, transparent);
  color: var(--tertiary);
  font-size: 0.8rem;
  font-weight: 650;
  letter-spacing: 0.02em;
}
.content-status-notice {
  display: grid;
  gap: 0.35rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--bdv-border);
  border-left: 0.28rem solid var(--secondary);
  border-radius: var(--bdv-radius-md);
  background: var(--bdv-surface);
  color: var(--darkgray);
}
.content-status-notice strong {
  color: var(--dark);
}
.content-status-notice span {
  line-height: 1.55;
}
.learning-archive-details {
  display: grid;
  gap: 0.25rem;
  margin-top: 0.15rem;
}
.learning-archive-details > span {
  color: var(--dark);
  font-weight: 600;
}
.learning-archive-details ul {
  margin: 0;
  padding-inline-start: 1.25rem;
}
.learning-archive-details li {
  margin: 0.2rem 0;
  line-height: 1.55;
  overflow-wrap: anywhere;
}
.learning-archive-details code {
  white-space: normal;
}
.content-status-notice a.internal {
  width: fit-content;
  color: var(--secondary);
}
.content-status-point-in-time {
  border-left-color: var(--tertiary);
}
`;
var style_default = style;

// components.tsx
import { Fragment, jsx, jsxs } from "preact/jsx-runtime";
var contentStatusMessages = {
  historical: "This article reflects my experience with the technologies and versions available when it was written. Some technical details may have changed since then.",
  superseded: "A newer article or approach replaces this one. This version remains available as part of the site's historical record.",
  "point-in-time": "This article records observations, decisions, or circumstances at the time it was written."
};
var learningArchiveContextMessages = {
  gatsby: "This article documents the site's Gatsby era; the site now runs on Quartz.",
  "google-domains": "Google Domains has since migrated to Squarespace. The instructions here reflect the service as it existed at the time and are retained for historical reference.",
  gsutil: "This article uses the legacy gsutil Cloud Storage CLI; current Google Cloud guidance uses gcloud storage. The original commands are retained for historical reference."
};
function getArticleContext(frontmatter) {
  const rawStatus = frontmatter?.status;
  const status = rawStatus === "historical" || rawStatus === "superseded" || rawStatus === "point-in-time" ? rawStatus : "current";
  const authorship = frontmatter?.authorship === "ai" ? "ai" : "user";
  const supersededBy = typeof frontmatter?.supersededBy === "string" && frontmatter.supersededBy.trim() !== "" ? frontmatter.supersededBy : void 0;
  const rawContexts = Array.isArray(frontmatter?.learningArchiveContexts) ? frontmatter.learningArchiveContexts : [];
  const learningArchiveContexts = rawContexts.filter(
    (context) => context === "gatsby" || context === "google-domains" || context === "gsutil"
  );
  return { status, authorship, supersededBy, learningArchiveContexts };
}
var ArticleContext = () => {
  const Context = ({ fileData }) => {
    const data = getArticleContext(fileData.frontmatter);
    if (data.status === "current" && data.authorship === "user") return null;
    return /* @__PURE__ */ jsxs("aside", { class: "article-context", "aria-label": "Article context", children: [
      data.authorship === "ai" && /* @__PURE__ */ jsx("p", { class: "article-authorship", children: "Written by AI" }),
      data.status !== "current" && /* @__PURE__ */ jsxs("div", { class: `content-status-notice content-status-${data.status}`, children: [
        /* @__PURE__ */ jsx("strong", { children: data.status === "historical" ? "Learning archive" : data.status === "superseded" ? "Superseded article" : "Point-in-time journal" }),
        /* @__PURE__ */ jsx("span", { children: contentStatusMessages[data.status] }),
        data.status === "historical" && data.learningArchiveContexts.length > 0 && /* @__PURE__ */ jsxs("div", { class: "learning-archive-details", children: [
          /* @__PURE__ */ jsx("span", { children: "Also note:" }),
          /* @__PURE__ */ jsx("ul", { children: data.learningArchiveContexts.map((context) => /* @__PURE__ */ jsx("li", { children: context === "gsutil" ? /* @__PURE__ */ jsxs(Fragment, { children: [
            "This article uses the legacy ",
            /* @__PURE__ */ jsx("code", { children: "gsutil" }),
            " Cloud Storage CLI; current Google Cloud guidance uses ",
            /* @__PURE__ */ jsx("code", { children: "gcloud storage" }),
            ". The original commands are retained for historical reference."
          ] }) : learningArchiveContextMessages[context] })) })
        ] }),
        data.status === "superseded" && data.supersededBy && /* @__PURE__ */ jsx("a", { class: "internal", href: data.supersededBy, children: "Read the successor article \u2192" })
      ] })
    ] });
  };
  Context.css = style_default;
  return Context;
};
export {
  ArticleContext as default
};
