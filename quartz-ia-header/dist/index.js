// components.tsx
import { resolveRelative } from "@quartz-community/utils";

// style.ts
var style = `
.site-navigation {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  min-width: 0;
}
.site-navigation a { position: relative; background: transparent; text-decoration: none; }
.site-identity {
  display: inline-flex;
  align-items: center;
  gap: 0.48rem;
  color: var(--dark);
  font-family: var(--codeFont);
  font-size: var(--bdv-site-identity-size);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.025em;
  white-space: nowrap;
}
.site-identity-mark {
  width: 0.75em;
  height: 0.75em;
  flex: 0 0 auto;
  object-fit: contain;
}
:root[saved-theme="dark"] .site-identity-mark {
  filter: invert(1);
}
.site-navigation-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.4rem 1.05rem;
}
.site-navigation-links a {
  color: var(--darkgray);
  font-size: var(--bdv-navigation-size);
  font-weight: 600;
}
.site-navigation-links a::after {
  content: "";
  position: absolute;
  right: 50%;
  bottom: -0.35rem;
  left: 50%;
  height: 2px;
  border-radius: 999px;
  background: var(--secondary);
  transition: right 160ms ease, left 160ms ease;
}
.site-navigation-links a:hover,
.site-navigation-links a.active { color: var(--secondary); }
.site-navigation-links a:hover::after,
.site-navigation-links a.active::after { right: 0; left: 0; }
@media (max-width: 800px) {
  header { flex-wrap: wrap; gap: 0.65rem; margin: 0; }
  .site-navigation { flex-basis: 100%; align-items: flex-start; flex-direction: column; gap: 0.8rem; }
  .site-navigation-links { justify-content: flex-start; gap: 0.45rem 1rem; }
}
`;
var style_default = style;

// components.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
var SiteNavigation = () => {
  const Navigation = ({ fileData }) => {
    const links = [
      ["Blog", "blog/index"],
      ["Topics", "topics/index"],
      ["T.I.L", "til/index"],
      ["iRevere", "irevere/index"],
      ["About", "bio/index"]
    ];
    const currentSlug = fileData.slug ?? "index";
    const isActive = (target) => {
      const section = target.split("/", 1)[0];
      if (section === "topics" && currentSlug.startsWith("tags/")) return true;
      return currentSlug === target || currentSlug.startsWith(`${section}/`);
    };
    return /* @__PURE__ */ jsxs("nav", { class: "site-navigation", "aria-label": "Primary navigation", children: [
      /* @__PURE__ */ jsxs(
        "a",
        {
          class: `site-identity internal${currentSlug === "index" ? " active" : ""}`,
          href: resolveRelative(fileData.slug, "index"),
          "aria-current": currentSlug === "index" ? "page" : void 0,
          children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                class: "site-identity-mark",
                src: resolveRelative(fileData.slug, "static/brand/bobbydreamer-mark.png"),
                alt: "",
                "aria-hidden": "true",
                width: "28",
                height: "28"
              }
            ),
            /* @__PURE__ */ jsx("span", { children: "bobby_dreamer" })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { class: "site-navigation-links", children: links.map(([label, target]) => /* @__PURE__ */ jsx(
        "a",
        {
          class: `internal${isActive(target) ? " active" : ""}`,
          href: resolveRelative(fileData.slug, target),
          "aria-current": isActive(target) ? "page" : void 0,
          children: label
        }
      )) })
    ] });
  };
  Navigation.css = style_default;
  return Navigation;
};
export {
  SiteNavigation as default
};
