# Step 8B — Google Analytics 4

Measurement ID: `G-ZK6YJ4RVTN`

## Included

- Google tag added to 35 public portfolio pages.
- `/assets/analytics.js` added for custom events.
- Search pages keep `/assets/search.js` before analytics tracking.

## Excluded intentionally

- `/nathan_airbnb.html`
- `/check-in/3BDR_Historic_Waterside_Enclave/48_Hight_St.html`

These operational Airbnb pages are excluded so their traffic does not mix with portfolio analytics.

## Custom events

- `language_switch`
- `portfolio_search`
- `search_result_click`
- `select_content`
- `cv_view`
- `cv_download`
- `contact_click`
- `social_click`

## GA4 recommended settings

In Admin → Data streams → Web stream → Enhanced measurement:

- Keep Page views, Scrolls, Outbound clicks and File downloads enabled.
- Disable Site search because this repository sends `portfolio_search` itself.
- Disable page views based on browser history changes because Search updates `?q=` with `history.replaceState()`.

## Recommended key events

- `contact_click`
- `cv_download`

## Suggested event-scoped custom dimensions

- Site language → `site_language`
- Site section → `site_section`
- Target language → `to_language`
- Search language → `search_language`
- Search result title → `result_title`
- Search result type → `result_type`
- Content title → `content_title`
- Source section → `source_section`
- Contact method → `contact_method`
- Social platform → `social_platform`
