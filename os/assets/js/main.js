(() => {
  const root = document.documentElement;
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const themeButton = document.querySelector("[data-theme-toggle]");
  const yearTargets = document.querySelectorAll("[data-current-year]");

  const updateHeader = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 10);
  };

  const closeMenu = () => {
    if (!nav || !menuButton) return;
    nav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  };

  const setThemeLabel = () => {
    if (!themeButton) return;
    const isDark = root.dataset.theme === "dark";
    themeButton.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    themeButton.setAttribute("title", isDark ? "Light theme" : "Dark theme");
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("is-open")) return;
      if (!nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
  }

  if (themeButton) {
    setThemeLabel();
    themeButton.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("khaitrios-theme", next); } catch (_) {}
      setThemeLabel();
    });
  }

  yearTargets.forEach((target) => {
    target.textContent = String(new Date().getFullYear());
  });


})();