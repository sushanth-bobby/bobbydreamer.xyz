---
title: Features of this gatsby theme from LekoArts
date: 2020-10-02
tags:
  - web-development
  - gatsbyjs
gatsbyBanner: ./defence-against-the-dark-arts.jpg
aliases:
  - gatsby-theme-features
---

## This is a demo page
#### Feature testing 

Here will a React component go:



Here will a live code example go:

```js
const onClick = () => {
  alert("You opened me");
};
render(<button onClick={onClick}>Alohomora!</button>);
```

Here will a normal code block go:

```js
(function() {

var cache = {};
var form = $('form');
var minified = true;

var dependencies = {};

var treeURL = 'https://api.github.com/repos/PrismJS/prism/git/trees/gh-pages?recursive=1';
var treePromise = new Promise(function(resolve) {
	$u.xhr({
		url: treeURL,
		callback: function(xhr) {
			if (xhr.status < 400) {
				resolve(JSON.parse(xhr.responseText).tree);
			}
		}
	});
});
```

A code block with a JSDoc comment, short, and long comment:

```js
/**
 * Get value out of string (e.g. rem => px)
 * If value is px strip the px part
 * If the input is already a number only return that value
 * @param {string | number} input
 * @param {number} [rootFontSize]
 * @return {number} Number without last three characters
 * @example removeLastThree('6rem') => 6
 */
const getValue = (input, rootFontSize = 16) => {
  if (typeof input === `number`) {
    return input / rootFontSize;
  }

  const isPxValue = input.slice(-2) === `px`;

  if (isPxValue) {
    return parseFloat(input.slice(0, -2));
  }

  return parseFloat(input.slice(0, -3));
};

// This is a little helper function
const helper = (a, b) => a + b;

// This is also a little helper function but this time with a really long one-line comment that should show some more details
const morehelper = (a, b) => a * b;

export { getValue, helper, morehelper };
```

Normal block without language:

```
import Test from "../components/test"

const Layout = ({ children }) => (
  <Test>
    {children}
  </Test>
)

export default Layout
```

Code block with code highlighting:

```jsx:title=src/components/post.jsx {5-7,10}
import React from "react";

const Post = ({ data: { post } }) => (
  <Layout>
    <Heading variant="h2" as="h2">
      {post.title}
    </Heading>
    <p
      sx={{
        color: `secondary`,
        mt: 3,
        a: { color: `secondary` },
        fontSize: [1, 1, 2],
      }}
    >
      <span>{post.date}</span>
      {post.tags && (
        <React.Fragment>
          {` — `}
          <ItemTags tags={post.tags} />
        </React.Fragment>
      )}
    </p>
    <section
      sx={{
        ...CodeStyles,
        my: 5,
        ".gatsby-resp-image-wrapper": { my: 5, boxShadow: `lg` },
      }}
    >
      <MDXRenderer>{post.body}</MDXRenderer>
    </section>
  </Layout>
);

export default Post;
```

Code block without title:

```
Harry Potter and the Philosopher's Stone
```

Code block without lineNumbers (but lang):

```text noLineNumbers
Harry Potter and the Chamber of Secrets
```

Code block without lineNumbers (and without lang):

```noLineNumbers
Harry Potter and the Chamber of Secrets
```

Code block with only the title:

```:title=src/utils/scream.js
const scream = (input) => window.alert(input)
```

Code block with only the title but without lineNumbers:

```:title=src/utils/scream.js noLineNumbers
const scream = (input) => window.alert(input)
```

Line highlighting without code title:

```js {2,4-5}
const test = 3;
const foo = "bar";
const harry = "potter";
const hermione = "granger";
const ron = "weasley";
```

Here will `inline code` go, just inside the text. Wow!

Code block without line numbers but with highlighting, language, and title:

```tsx:title=src/components/blog.tsx {7-9,16} noLineNumbers
import React from "react";

const Blog = ({ posts }: PostsProps) => {
  const { tagsPath, basePath } = useSiteMetadata();

  return (
    <Layout>
      <Flex sx={{ alignItems: `center`, justifyContent: `space-between` }}>
        <Heading variant="h2" as="h2">
          Blog
        </Heading>
        <Styled.a
          as={Link}
          sx={{ variant: `links.secondary` }}
          to={`/${basePath}/${tagsPath}`.replace(/\/\/+/g, `/`)}
        >
          View all tags
        </Styled.a>
      </Flex>
      <Listing posts={posts} sx={{ mt: [4, 5] }} />
    </Layout>
  );
};

export default Blog;
```

### Table 
| Number | Title                                    | Year |
| ------ | ---------------------------------------- | ---: |
| 1      | Harry Potter and the Philosopher’s Stone | 2001 |
| 2      | Harry Potter and the Chamber of Secrets  | 2002 |
| 3      | Harry Potter and the Prisoner of Azkaban | 2004 |

[View raw (TEST.md)](https://raw.github.com/adamschwartz/github-markdown-kitchen-sink/master/README.md)

### Six headers

    # Header 1
    ## Header 2
    ### Header 3
    #### Header 4
    ##### Header 5
    ###### Header 6

### Blockquote

    > Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus. Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.

### Blockquote : Multiple attributes
> ## This is a header.
>
> 1. This is the first list item.
> 2. This is the second list item.
>
> Here's some example code:
>
>     Markdown.generate();

    > ## This is a header.
    > 1. This is the first list item.
    > 2. This is the second list item.
    >
    > Here's some example code:
    >
    >     Markdown.generate();

### Bullets
- Red
  - Green
    - Blue
      * Red
        * Green
  * Blue
  - Red
    - Green
- Blue

```markdown
- Red
  - Green
    - Blue
      * Red
        * Green
  * Blue
  - Red
    - Green
- Blue
```

### Formatting
- `code goes` here in this line
- **bold** goes here
- *italics* goes here

```markdown
- `code goes` here in this line
- **bold** goes here
- *italics* goes here
```

1. Buy flour and salt
1. Mix together with water
1. Bake

```markdown
1. Buy flour and salt
1. Mix together with water
1. Bake
```

### Code block with multiple copies
Paragraph:

    Code

<!-- -->

    Paragraph:

        Code

### HR : Horizontal Ruler
---

---

---

---

---

    * * *

    ***

    *****

    - - -

    ---------------------------------------

### Hyperlinks

This is [an example](http://example.com "Example") link.

[This link](http://example.com) has no title attr.

This is [an example][id] reference-style link.

[id]: http://example.com "Optional Title"

    This is [an example](http://example.com "Example") link.

    [This link](http://example.com) has no title attr.

    This is [an example] [id] reference-style link.

    [id]: http://example.com "Optional Title"

### Image

![Alt Text](https://placehold.it/200x50 "Image Title")

    ![Alt Text](https://placehold.it/200x50 "Image Title")
