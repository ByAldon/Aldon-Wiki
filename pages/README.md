# How to Add Content to Your Wiki

This wiki is managed by one central "table of contents" file: `pages/index.json`. This file tells the wiki which categories and pages exist.

**Important:** The `index.json` file uses the JSON format, which does **not** support comments. To help you understand its structure, this guide provides a commented example.

---

## Understanding `index.json`

The file has two main parts: `categories` and `pages`.

### The `categories` List

First, define a category. This is the collapsible folder you see in the sidebar.

```jsonc
// Add your new category to this list.
"categories": [
  {
    "id": "getting-started", // A unique, simple ID (no spaces). Used to link pages.
    "name": "Getting Started" // The display name you see in the sidebar.
  },
  {
    "id": "project-x",
    "name": "Project X"
  }
]
```

### The `pages` List

Next, add your page and link it to a category using the `categoryId`.

To create nested pages (or "sub-pages"), add a `pages` property to any page object. This property should be an array of more page objects. You can nest pages as deeply as you like.

```jsonc
// Add your new page to this list.
"pages": [
  {
    "id": "welcome", // A unique, simple ID for the page.
    "title": "Welcome!", // The page title you see in the sidebar.
    "categoryId": "getting-started", // MUST match a category "id" from the list above.
    "path": "pages/Getting Started/Welcome.md",
    // This page has a sub-page.
    "pages": [
      {
        "id": "markdown-cheatsheet",
        "title": "Markdown Cheatsheet",
        "categoryId": "getting-started",
        "path": "pages/Getting Started/Markdown Cheatsheet.md"
      }
    ]
  },
  {
    "id": "meeting-notes",
    "title": "Meeting Notes",
    "categoryId": "project-x",
    "path": "pages/Project X/Meeting Notes.md"
  }
]
```

---

## Two Steps to Add a New Page

1.  **Create your `.md` file** inside the `/pages` directory (e.g., `pages/Project X/My New Page.md`).
2.  **Update `pages/index.json`**:
    *   Add your category to the `categories` list if it's new.
    *   Add your page details to the `pages` list, nesting it under a parent page if desired.

That's it! Your new content will appear automatically.
