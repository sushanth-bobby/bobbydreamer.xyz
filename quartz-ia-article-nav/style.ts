const style = `
.article-sequence-navigation {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.article-sequence-navigation a {
  display: flex;
  flex-direction: column;
  min-height: 3.4rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--bdv-border, var(--lightgray));
  border-radius: var(--bdv-radius-md, 0.75rem);
  background: var(--bdv-surface-raised, var(--light));
  color: var(--dark);
  text-decoration: none;
  box-shadow: var(--bdv-shadow-sm, none);
  transition: transform 160ms ease, border-color 160ms ease;
}
.article-sequence-navigation a:hover {
  transform: translateY(-2px);
  border-color: var(--secondary);
}
.article-sequence-navigation a > span {
  color: var(--gray);
  font-size: 0.76rem;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
.article-sequence-navigation a > strong { margin-top: 0.25rem; color: var(--dark); line-height: 1.35; }
.article-sequence-next { grid-column: 2; text-align: right; }
@media (max-width: 800px) {
  .article-sequence-navigation { grid-template-columns: 1fr; }
  .article-sequence-next { grid-column: 1; text-align: left; }
}
`

export default style
