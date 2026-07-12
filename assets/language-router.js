(() => {
  "use strict";

  const STORAGE_KEY = "ktr-language";
  const SUPPORTED_LANGUAGES = new Set(["en", "vi"]);
  const currentLanguage = document.documentElement.lang
    .toLowerCase()
    .split("-")[0];

  function getSavedLanguage() {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      return SUPPORTED_LANGUAGES.has(value) ? value : null;
    } catch (error) {
      return null;
    }
  }

  function saveLanguage(language) {
    if (!SUPPORTED_LANGUAGES.has(language)) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch (error) {
      // The language switch still works if storage is unavailable.
    }
  }

  function getBrowserLanguage() {
    const languages = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language || "en"];

    for (const language of languages) {
      const normalized = String(language).toLowerCase();
      if (normalized.startsWith("vi")) return "vi";
      if (normalized.startsWith("en")) return "en";
    }

    return "en";
  }

  function getAlternateUrl(language) {
    const alternate = document.querySelector(
      `link[rel~="alternate"][hreflang="${language}"]`
    );

    if (!alternate?.href) return null;

    try {
      const url = new URL(alternate.href, window.location.href);
      // Preserve campaign parameters and useful section anchors.
      url.search = window.location.search;
      url.hash = window.location.hash;
      return url.href;
    } catch (error) {
      return alternate.href;
    }
  }

  function configureSwitchers() {
    document.querySelectorAll("[data-language-switch]").forEach((link) => {
      const language = link.dataset.languageSwitch;
      if (!SUPPORTED_LANGUAGES.has(language)) return;

      const alternateUrl = getAlternateUrl(language);
      if (alternateUrl) link.href = alternateUrl;

      const isCurrent = language === currentLanguage;
      link.classList.toggle("is-active", isCurrent);
      if (isCurrent) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }

      link.addEventListener("click", () => saveLanguage(language));
    });
  }

  function createSuggestionBanner() {
    const vietnameseUrl = getAlternateUrl("vi");
    if (!vietnameseUrl) return;

    const banner = document.createElement("aside");
    banner.className = "ktr-language-suggestion";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Gợi ý ngôn ngữ");
    banner.innerHTML = `
      <button class="ktr-language-suggestion__close" type="button" aria-label="Đóng">×</button>
      <div class="ktr-language-suggestion__eyebrow">Ngôn ngữ</div>
      <strong>Bạn muốn xem phiên bản tiếng Việt?</strong>
      <p>Website có nội dung bằng cả tiếng Anh và tiếng Việt.</p>
      <div class="ktr-language-suggestion__actions">
        <a class="ktr-language-suggestion__primary" href="${vietnameseUrl}">Xem tiếng Việt</a>
        <button type="button" data-stay-english>Continue in English</button>
      </div>
    `;

    const vietnameseLink = banner.querySelector("a");
    const stayEnglish = banner.querySelector("[data-stay-english]");
    const closeButton = banner.querySelector(".ktr-language-suggestion__close");

    vietnameseLink?.addEventListener("click", () => saveLanguage("vi"));

    const dismiss = () => {
      saveLanguage("en");
      banner.remove();
    };

    stayEnglish?.addEventListener("click", dismiss);
    closeButton?.addEventListener("click", dismiss);
    document.body.appendChild(banner);
  }

  function handleHomepagePreference() {
    const isEnglishHomepage =
      currentLanguage === "en" &&
      (window.location.pathname === "/" || window.location.pathname === "/index.html");

    if (!isEnglishHomepage) return;

    const savedLanguage = getSavedLanguage();
    const vietnameseUrl = getAlternateUrl("vi");

    // Redirect only when the visitor explicitly selected Vietnamese before.
    if (savedLanguage === "vi" && vietnameseUrl) {
      window.location.replace(vietnameseUrl);
      return;
    }

    if (savedLanguage === "en") return;
    if (getBrowserLanguage() === "vi") createSuggestionBanner();
  }

  configureSwitchers();
  handleHomepagePreference();
})();
