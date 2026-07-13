# Step 8D — Mobile Performance & Core Web Vitals

This patch targets the PageSpeed mobile findings reported on the homepage:

- FCP 5.3 s
- LCP 6.6 s
- Speed Index 5.6 s
- TBT 0 ms
- CLS 0

Changes:

1. Responsive AVIF/WebP hero images (320/480/640/760).
2. Responsive LCP preload and explicit image sizing.
3. Google Fonts and Font Awesome moved out of the high-priority preload queue.
4. Shared non-critical CSS loaded asynchronously on the two homepages, with critical language styles inline.
5. GA4 kept fully functional but its third-party library loads after the critical render on the two homepages.
6. Removed scroll-time forced layout reads by using IntersectionObserver for section state.
7. Progress uses transform instead of changing width.
8. Decorative animations and paint-heavy effects reduced on mobile.
9. Below-the-fold mobile sections use content-visibility where supported.

GitHub Pages controls Cache-Control response headers, so the cache-lifetime audit can remain partially visible. The responsive assets substantially reduce the bytes affected by that audit.
