# Bilingual setup: English + Vietnamese

The production language structure is:

- English: `/`, `/about.html`, `/projects/`, `/articles/`, `/contact.html`, `/View_CV.html`
- Vietnamese: `/vi/`, `/vi/about.html`, `/vi/projects/`, `/vi/articles/`, `/vi/contact.html`, `/vi/View_CV.html`

## Selection logic

1. The URL always determines the displayed language.
2. EN/VI links use each page's `hreflang` declarations.
3. Browser language is checked only on the English homepage.
4. A first-time Vietnamese-browser visitor sees a suggestion instead of a forced redirect.
5. A manual choice is stored as `ktr-language` in `localStorage`.
6. A returning visitor who explicitly selected Vietnamese is redirected from the English homepage to `/vi/`.
7. Deep links from search engines are never automatically redirected.

## Files added or updated

- `assets/language-router.js`
- `assets/site-system.css`
- Six English pages
- Six Vietnamese pages
- `sitemap.xml`

When adding another translated page, add reciprocal `hreflang="en"`, `hreflang="vi"`, and `hreflang="x-default"` links, then include `/assets/language-router.js` and the language switch markup.
