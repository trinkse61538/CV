# Deployment checklist

1. Upload the complete contents of this folder to the root of the `trinkse61538/CV` repository.
2. Preserve `CNAME`, `.nojekyll`, `assets/`, `projects/`, and `articles/`.
3. Verify GitHub Pages finishes building successfully.
4. Open these routes after deployment:
   - `/`
   - `/projects/`
   - `/articles/`
   - `/about.html`
   - `/contact.html`
   - `/sitemap.xml`
   - `/llms.txt`
5. Submit `https://khaitringuyen.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
6. Test the home page, CV page, OpenClaw page, Mautic page, dashboard, and one article with Google's Rich Results Test / Schema Markup Validator.
7. Confirm `nathan_airbnb.html` returns a `noindex` robots meta tag and is absent from the sitemap.
8. Use Facebook Sharing Debugger and LinkedIn Post Inspector to refresh the new local social preview image.

## Architecture decisions
- Existing case-study pages are preserved instead of duplicated.
- New project and article hubs provide crawlable internal links.
- The Airbnb operational map is not publicly promoted and is marked noindex because it contains detailed addresses.
- `llms.txt` is included as an experimental machine-readable summary, not as a replacement for semantic HTML, structured data, sitemaps or normal indexing.
