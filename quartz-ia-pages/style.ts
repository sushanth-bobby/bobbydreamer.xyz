const style = `
.blog-year-navigation {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.blog-archive-list { list-style: none; padding: 0; }
.blog-archive-list > li { margin: 0 0 1.5rem; }
.blog-archive-list h3, .blog-archive-list p { margin: 0.25rem 0; }
.blog-archive-list time { color: var(--gray); }
.topics-landing ul { columns: 2; }
@media (max-width: 800px) {
  .topics-landing ul { columns: 1; }
}
`

export default style
