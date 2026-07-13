(() => {
  "use strict";

  const GA_ID = "G-ZK6YJ4RVTN";
  const siteLanguage = document.documentElement.lang
    ?.toLowerCase()
    .startsWith("vi")
    ? "vi"
    : "en";
  const currentPath = window.location.pathname;

  function detectSiteSection(pathname) {
    if (pathname === "/" || pathname === "/index.html" || pathname === "/vi/" || pathname === "/vi/index.html") return "Home";
    if (/^\/(?:vi\/)?projects\//i.test(pathname)) return "Projects";
    if (/^\/(?:vi\/)?articles\//i.test(pathname)) return "Articles";
    if (/^\/(?:vi\/)?knowledge\//i.test(pathname)) return "Knowledge";
    if (/^\/(?:vi\/)?search\//i.test(pathname)) return "Search";
    if (/\/View_CV\.html$/i.test(pathname)) return "CV";
    if (/\/about\.html$/i.test(pathname)) return "About";
    if (/\/contact\.html$/i.test(pathname)) return "Contact";
    if (/\/(?:OpenClaw|email_showcase|data_analyze_visualize|saigonrootmusic)\.html$/i.test(pathname)) return "Systems";
    if (/\/404\.html$/i.test(pathname)) return "404";
    return "Other";
  }

  const siteSection = detectSiteSection(currentPath);
  const existingTag = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');

  // On performance-sensitive pages, queue GA commands immediately but load the
  // third-party library only after the page has finished its critical render.
  if (!existingTag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };

    window.gtag("js", new Date());
    window.gtag("set", {
      site_language: siteLanguage,
      site_section: siteSection
    });
    window.gtag("config", GA_ID, {
      send_page_view: true,
      content_group: siteSection
    });

    let tagRequested = false;
    const loadGoogleTag = () => {
      if (tagRequested || document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return;
      tagRequested = true;
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(script);
    };

    const scheduleGoogleTag = () => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(loadGoogleTag, { timeout: 1800 });
      } else {
        window.setTimeout(loadGoogleTag, 1200);
      }
    };

    if (document.readyState === "complete") {
      scheduleGoogleTag();
    } else {
      window.addEventListener("load", scheduleGoogleTag, { once: true });
    }

    // A real interaction is a stronger signal than the idle timer.
    ["pointerdown", "keydown", "touchstart"].forEach((eventName) => {
      window.addEventListener(eventName, loadGoogleTag, {
        once: true,
        passive: true,
        capture: true
      });
    });
  }

let lastSearchSignature = "";

  function sendEvent(eventName, parameters = {}) {
    if (typeof window.gtag !== "function") return;

    window.gtag("event", eventName, {
      site_language: siteLanguage,
      page_path: currentPath,
      ...parameters
    });
  }

  function cleanText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);
  }

  function getText(element) {
    if (!element) return "";

    return cleanText(
      element.getAttribute("aria-label") ||
      element.getAttribute("title") ||
      element.textContent
    );
  }

  function getSourceSection(element) {
    if (element.closest("header")) return "header";
    if (element.closest("footer")) return "footer";

    const section = element.closest("section");
    const heading = section?.querySelector("h1, h2, h3");

    return getText(heading) || "body";
  }

  function createUrl(href) {
    try {
      return new URL(href, window.location.href);
    } catch (error) {
      return null;
    }
  }

  function getFileName(url) {
    const rawName = url.pathname.split("/").pop() || "";

    try {
      return decodeURIComponent(rawName);
    } catch (error) {
      return rawName;
    }
  }

  function detectContentType(pathname) {
    if (/^\/(?:vi\/)?projects\/[^/]+\.html$/i.test(pathname)) {
      return "project";
    }

    if (/^\/(?:vi\/)?articles\/[^/]+\.html$/i.test(pathname)) {
      return "article";
    }

    return "";
  }

  // Record a real CV page view, including visits arriving directly from search engines.
  if (/\/View_CV\.html$/i.test(currentPath)) {
    sendEvent("cv_view", {
      cv_language: siteLanguage
    });
  }

  document.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest("a[href]");
      if (!link) return;

      const url = createUrl(link.getAttribute("href"));
      if (!url) return;

      const linkText = getText(link);
      const sourceSection = getSourceSection(link);

      // Language flag switch.
      if (link.matches("[data-language-switch]")) {
        sendEvent("language_switch", {
          from_language: siteLanguage,
          to_language: link.dataset.languageSwitch || "",
          link_url: url.href,
          source_section: sourceSection
        });
        return;
      }

      // Semantic Search result click.
      const searchResult = link.closest(".ktr-search-result");
      if (searchResult) {
        const resultItems = [
          ...document.querySelectorAll(".ktr-search-result")
        ];
        const searchInput = document.querySelector("[data-search-input]");

        sendEvent("search_result_click", {
          search_term: cleanText(searchInput?.value),
          result_title: getText(searchResult.querySelector("h2")),
          result_type: getText(
            searchResult.querySelector(".ktr-search-type")
          ).toLowerCase(),
          result_position: resultItems.indexOf(searchResult) + 1,
          link_url: url.href
        });
        return;
      }

      // Direct contact actions.
      if (url.protocol === "mailto:") {
        sendEvent("contact_click", {
          contact_method: "email",
          link_url: url.href,
          source_section: sourceSection
        });
        return;
      }

      if (url.protocol === "tel:") {
        sendEvent("contact_click", {
          contact_method: "phone",
          link_url: url.href,
          source_section: sourceSection
        });
        return;
      }

      const hostname = url.hostname
        .replace(/^www\./, "")
        .toLowerCase();

      if (hostname.endsWith("linkedin.com")) {
        sendEvent("contact_click", {
          contact_method: "linkedin",
          link_url: url.href,
          source_section: sourceSection
        });
        return;
      }

      if (
        hostname.endsWith("github.com") ||
        hostname.endsWith("facebook.com")
      ) {
        sendEvent("social_click", {
          social_platform: hostname.endsWith("github.com")
            ? "github"
            : "facebook",
          link_url: url.href,
          source_section: sourceSection
        });
        return;
      }

      // CV-specific PDF download. GA4 Enhanced Measurement may also emit file_download.
      const fileName = getFileName(url);
      if (
        /\.pdf$/i.test(fileName) &&
        /(cv|resume|nguyen khai tri)/i.test(fileName)
      ) {
        sendEvent("cv_download", {
          file_name: fileName,
          link_url: url.href,
          source_section: sourceSection
        });
        return;
      }

      // Project and article selection from cards, related content, navigation or search-free pages.
      const contentType = detectContentType(url.pathname);
      if (contentType) {
        const card = link.closest("article, .ktr-card, .project-card, .article-card");
        const contentTitle =
          getText(card?.querySelector("h2, h3")) || linkText;

        sendEvent("select_content", {
          content_type: contentType,
          item_id: url.pathname,
          content_title: contentTitle,
          source_section: sourceSection,
          link_url: url.href
        });
      }
    },
    true
  );

  // Semantic Search tracking. Events are sent after the rendered result list settles.
  const searchInput = document.querySelector("[data-search-input]");
  const searchResults = document.querySelector("[data-search-results]");

  if (searchInput && searchResults) {
    let searchTimer;

    function trackPortfolioSearch() {
      const searchTerm = cleanText(searchInput.value);
      if (searchTerm.length < 2) return;

      const resultCount = document.querySelectorAll(
        ".ktr-search-result"
      ).length;
      const signature = `${searchTerm.toLowerCase()}|${resultCount}`;

      if (signature === lastSearchSignature) return;
      lastSearchSignature = signature;

      sendEvent("portfolio_search", {
        search_term: searchTerm,
        search_language: siteLanguage,
        result_count: resultCount
      });
    }

    function scheduleSearchTracking(delay = 700) {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(trackPortfolioSearch, delay);
    }

    searchInput.addEventListener("input", () => {
      scheduleSearchTracking(900);
    });

    document
      .querySelector("[data-search-form]")
      ?.addEventListener("submit", () => {
        scheduleSearchTracking(250);
      });

    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-search-chip]")) {
        scheduleSearchTracking(350);
      }
    });

    new MutationObserver(() => {
      scheduleSearchTracking(350);
    }).observe(searchResults, {
      childList: true,
      subtree: true
    });
  }

})();
