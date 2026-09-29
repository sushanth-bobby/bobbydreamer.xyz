const style = `
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
`

export default style
