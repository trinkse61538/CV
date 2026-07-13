# Step 7 — Semantic-style Search

## New pages
- `/search/` — English search
- `/vi/search/` — Vietnamese search

## New assets
- `/assets/search.js`
- `/assets/search-index.json`

## How it works
The search runs entirely in the browser. It uses weighted fields, bilingual synonym groups, prefix matching and a static index generated from public sitemap pages. No query is sent to a server or third-party API.

## SEO decision
The two search pages use `noindex,follow` and are intentionally excluded from `sitemap.xml`. Internal search result URLs should not compete with canonical project, article and profile pages. The central WebSite schema includes a `SearchAction`.

## Maintenance
When substantial new public pages are added, regenerate `assets/search-index.json` or manually add a record.

## GitHub GUI
The Step 7 patch contains no hidden files. Upload the contents of the patch into the repository root and overwrite matching files.
