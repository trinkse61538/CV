# SEO, GEO & Information Architecture Upgrade

Updated: 2026-07-12

## What changed

- Preserved the existing home page, CV, OpenClaw, Mautic, dashboards, Airbnb map and Saigon Root Music experiences.
- Added a connected Projects directory, Articles directory, About page, Contact page and custom 404 page.
- Added public case studies for Hihie's Scent OS, the paid-media/tracking/CRM funnel, Airbnb co-host operations and web experiences.
- Added three long-form articles about Scent OS product thinking, OpenClaw marketing-report automation and performance marketing in AI workflows.
- Added visible “portfolio in one minute”, ecosystem and FAQ sections to the home page.
- Added internal navigation between all public portfolio areas.
- Added local 1200×630 Open Graph images and replaced the externally hosted hero image with an optimized local WebP.
- Added unique titles, descriptions, canonical URLs, robots directives, Open Graph and Twitter metadata.
- Added JSON-LD using ProfilePage, Person, WebSite, CollectionPage, Article, CreativeWork, SoftwareSourceCode, WebApplication, Dataset, ContactPage and BreadcrumbList where appropriate.
- Rebuilt `sitemap.xml` to include every public indexable page.
- Added `llms.txt`, `llms-full.txt`, `humans.txt`, `manifest.webmanifest` and `.nojekyll`.
- Added an on-page portfolio menu to legacy showcase pages without redesigning their original visual identity.

## Important privacy decision

`nathan_airbnb.html` and the detailed 48 High St guest guide contain operational location/property information. They are now marked `noindex,nofollow,noarchive,nosnippet` and excluded from the sitemap. A sanitized public Airbnb operations case study replaces them in the public project architecture.

## URL architecture

- `/` — main profile and portfolio
- `/projects/` — all public projects
- `/articles/` — all articles
- `/about.html` — entity/profile context
- `/contact.html` — contact options
- `/View_CV.html` — detailed CV
- `/OpenClaw.html` — OpenClaw project
- `/email_showcase.html` — Mautic project
- `/data_analyze_visualize.html` — data dashboards
- `/saigonrootmusic.html` — web experience
- `/projects/scent-os.html` — Scent OS case study
- `/projects/performance-marketing-funnel.html` — growth funnel case study
- `/projects/airbnb-cohosting.html` — sanitized operations case study
- `/projects/web-experiences.html` — web work overview

## Deployment checks

See `DEPLOYMENT_CHECKLIST.md` before replacing the current GitHub repository contents.
