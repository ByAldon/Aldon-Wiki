# Markdown Cheatsheet

This page provides a quick reference for the most common Markdown syntax.

## Text Formatting

**Bold Text:** `**Bold Text**`
*Italic Text:* `*Italic Text*`
~~Strikethrough:~~ `~~Strikethrough~~`

## Headings

# Heading 1

## Heading 2

### Heading 3

## Lists

### Unordered List

- Item 1
- Item 2
  - Sub-item 2.1
  - Sub-item 2.2

### Ordered List

1. First item
2. Second item
3. Third item

## Links

You can create an inline link by wrapping link text in brackets `[ ]`, and then wrapping the URL in parentheses `( )`.

[Visit Aldon Wiki](https://www.aldon.info)

## Code

You can format code inline by wrapping it in backticks: `const greeting = "Hello, World!";`.

For larger code blocks, use triple backticks:

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet('Aldon Wiki User');
```

## Blockquotes

> To create a blockquote, add a `>` in front of a paragraph. It's useful for quoting text from another source.
> 
> > Blockquotes can be nested.
