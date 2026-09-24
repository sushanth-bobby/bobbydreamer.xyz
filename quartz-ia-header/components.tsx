import type { QuartzComponent, QuartzComponentConstructor } from "../quartz/components/types"
import { resolveRelative } from "@quartz-community/utils"
import style from "./style"

export const SiteNavigation: QuartzComponentConstructor = () => {
  const Navigation: QuartzComponent = ({ fileData }) => {
    const links = [
      ["Blog", "blog/index"],
      ["Topics", "topics/index"],
      ["T.I.L", "til/index"],
      ["iRevere", "irevere/index"],
      ["About", "bio/index"],
    ] as const
    const currentSlug = fileData.slug ?? "index"

    const isActive = (target: (typeof links)[number][1]) => {
      const section = target.split("/", 1)[0]
      if (section === "topics" && currentSlug.startsWith("tags/")) return true
      return currentSlug === target || currentSlug.startsWith(`${section}/`)
    }

    return (
      <nav class="site-navigation" aria-label="Primary navigation">
        <a
          class={`site-identity internal${currentSlug === "index" ? " active" : ""}`}
          href={resolveRelative(fileData.slug!, "index")}
          aria-current={currentSlug === "index" ? "page" : undefined}
        >
          <img
            class="site-identity-mark"
            src={resolveRelative(fileData.slug!, "static/brand/bobbydreamer-mark.png")}
            alt=""
            aria-hidden="true"
            width="28"
            height="28"
          />
          <span>bobby_dreamer</span>
        </a>
        <div class="site-navigation-links">
          {links.map(([label, target]) => (
            <a
              class={`internal${isActive(target) ? " active" : ""}`}
              href={resolveRelative(fileData.slug!, target)}
              aria-current={isActive(target) ? "page" : undefined}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>
    )
  }

  Navigation.css = style
  return Navigation
}

export default SiteNavigation
