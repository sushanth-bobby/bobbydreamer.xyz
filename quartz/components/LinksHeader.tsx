import { QuartzComponentConstructor } from "./types"
import style from "./styles/linksHeader.scss"

interface Options {
  links: Record<string, string>
}

export default (() => {
  function LinksHeader() {
    return (
      <div>
        <div id="links-header">
          <span>
            {/* <img src="../assets/user-secret-solid.svg" style="color: salmon; background-color: papayawhip; font-size:1.5em;"></img> */}
            <a href="/pages/about_me">about_me</a>
          </span>
          <span>
            {/* <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Books/Color/books_color.svg"></img> */}
            <a href="/blog">blog</a>
          </span>
          <span>
            {/* <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Brain/Color/brain_color.svg"></img> */}
            <a href="/pages/irevere">iRevere</a>
          </span>
          <span>
            {/* <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Parrot/Color/parrot_color.svg"></img> */}
            <a href="/pages/til">T.I.L</a>
          </span>
          <span>
            {/* Quick Commands */}
            {/* <img src="https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Triangular%20ruler/Color/triangular_ruler_color.svg"></img> */}
            <a href="/tags/cheats">Cheats</a>
          </span>
        </div>
      <hr style="background-color: var(--gray); border-top: 1px var(--gray) solid; margin-top: 1.3rem"></hr>
      </div>
    )
  }

  LinksHeader.css = style
  return LinksHeader
}) satisfies QuartzComponentConstructor