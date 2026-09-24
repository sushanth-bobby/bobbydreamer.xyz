const style = `
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
`

export default style
