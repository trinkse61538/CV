(() => {
  "use strict";

  const root = document.querySelector("[data-search-app]");
  if (!root) return;

  const locale = document.documentElement.lang?.toLowerCase().startsWith("vi") ? "vi" : "en";
  const copy = locale === "vi" ? {
    all: "Tất cả",
    result: "kết quả",
    results: "kết quả",
    initial: "Nội dung nổi bật trong portfolio",
    searching: "Đang tải dữ liệu tìm kiếm…",
    emptyTitle: "Chưa tìm thấy nội dung phù hợp",
    emptyBody: "Thử một chủ đề rộng hơn như Performance Marketing, CRM, AI, nước hoa, dashboard hoặc Airbnb.",
    open: "Mở nội dung",
    english: "Tiếng Anh",
    vietnamese: "Tiếng Việt",
    types: {profile:"Hồ sơ",collection:"Danh mục",project:"Dự án",article:"Bài viết",knowledge:"Kiến thức",tool:"Hệ thống",creative:"Sáng tạo"}
  } : {
    all: "All",
    result: "result",
    results: "results",
    initial: "Featured content across the portfolio",
    searching: "Loading the search index…",
    emptyTitle: "No closely related content found",
    emptyBody: "Try a broader topic such as performance marketing, CRM, AI, fragrance, dashboards or Airbnb.",
    open: "Open content",
    english: "English",
    vietnamese: "Vietnamese",
    types: {profile:"Profile",collection:"Collection",project:"Project",article:"Article",knowledge:"Knowledge",tool:"System",creative:"Creative"}
  };

  const form = root.querySelector("[data-search-form]");
  const input = root.querySelector("[data-search-input]");
  const status = root.querySelector("[data-search-status]");
  const resultsEl = root.querySelector("[data-search-results]");
  const filterWrap = root.querySelector("[data-search-filters]");
  const chips = [...root.querySelectorAll("[data-search-chip]")];
  let records = [];
  let activeFilter = "all";

  const synonymGroups = [
    ["performance marketing","paid media","paid acquisition","growth marketing","quang cao","quảng cáo","tang truong","tăng trưởng","user acquisition"],
    ["tracking","measurement","analytics","ga4","gtm","google tag manager","do luong","đo lường","phan tich","phân tích"],
    ["crm","lifecycle","mautic","lead scoring","segmentation","nurturing","phan khuc","phân khúc","nuoi duong","nuôi dưỡng"],
    ["ai","artificial intelligence","automation","openclaw","agent","telegram","tu dong hoa","tự động hóa","workflow"],
    ["report","reporting","dashboard","bao cao","báo cáo","visualization","truc quan hoa","trực quan hóa"],
    ["perfume","fragrance","scent","layering","nuoc hoa","nước hoa","mui huong","mùi hương","scent os"],
    ["airbnb","cohost","co-host","guest","property","can ho","căn hộ","khach","khách","remote operations"],
    ["web","website","html","css","javascript","responsive","ui","ux","interactive","giao dien","giao diện"],
    ["cv","resume","career","experience","profile","ho so","hồ sơ","kinh nghiem","kinh nghiệm"],
    ["google ads","meta ads","facebook ads","paid social","search ads"],
    ["ekyc","activation","account opening","conversion funnel","full funnel","kich hoat","kích hoạt","pheu","phễu"]
  ];

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9+#.\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
  }

  function expandedTerms(query) {
    const normalized = normalize(query);
    const base = new Set(normalized.split(" ").filter((token) => token.length > 1));
    if (normalized.length > 2) base.add(normalized);
    synonymGroups.forEach((group) => {
      const normalizedGroup = group.map(normalize);
      if (normalizedGroup.some((term) => normalized.includes(term) || base.has(term))) {
        normalizedGroup.forEach((term) => {
          base.add(term);
          term.split(" ").filter((token) => token.length > 2).forEach((token) => base.add(token));
        });
      }
    });
    return [...base];
  }

  function hasWordPrefix(haystack, token) {
    if (token.length < 4) return false;
    return haystack.split(" ").some((word) => word.startsWith(token) || token.startsWith(word) && word.length >= 4);
  }

  function scoreRecord(record, query) {
    const q = normalize(query);
    const terms = expandedTerms(query);
    const title = normalize(record.title);
    const description = normalize(record.description);
    const keywords = normalize(record.keywords.join(" "));
    const topics = normalize(record.topics.join(" "));
    const content = normalize(record.content);
    let score = 0;

    if (!q) {
      score = Number(record.priority || 0);
      score += Number(record.featured || 0) * 20;
      score += record.lang === locale ? 8 : 0;
      return score;
    }

    if (title === q) score += 120;
    if (title.includes(q)) score += 70;
    if (keywords.includes(q)) score += 48;
    if (topics.includes(q)) score += 40;
    if (description.includes(q)) score += 28;
    if (content.includes(q)) score += 10;

    terms.forEach((term) => {
      if (title.split(" ").includes(term)) score += 18;
      else if (title.includes(term)) score += 12;
      else if (hasWordPrefix(title, term)) score += 7;
      if (keywords.includes(term)) score += 9;
      if (topics.includes(term)) score += 8;
      if (description.includes(term)) score += 5;
      if (content.includes(term)) score += 1.5;
    });

    score += Number(record.priority || 0) * 0.45;
    if (record.lang === locale) score += 3;
    if (record.lang !== locale && record.type !== "tool" && record.type !== "creative") score -= 4;
    return score;
  }

  function displayRecords(query) {
    let ranked = records
      .filter((record) => record.lang === locale || record.lang === "und" || (locale === "vi" && (record.type === "tool" || record.type === "creative")))
      .map((record) => ({...record, score: scoreRecord(record, query)}))
      .filter((record) => !query || record.score > 14)
      .filter((record) => activeFilter === "all" || record.type === activeFilter)
      .sort((a,b) => b.score - a.score || b.priority - a.priority || a.title.localeCompare(b.title));

    if (!query) ranked = ranked.filter((record) => record.featured).slice(0, 8);
    else ranked = ranked.slice(0, 12);

    render(ranked, query);
  }

  function render(items, query) {
    status.textContent = query
      ? `${items.length} ${items.length === 1 ? copy.result : copy.results} · “${query}”`
      : copy.initial;

    if (!items.length) {
      resultsEl.innerHTML = `<div class="ktr-search-empty"><h2>${escapeHtml(copy.emptyTitle)}</h2><p>${escapeHtml(copy.emptyBody)}</p></div>`;
      return;
    }

    resultsEl.innerHTML = items.map((item) => {
      const type = copy.types[item.type] || item.type;
      const langLabel = item.lang === "vi" ? copy.vietnamese : copy.english;
      const showLang = item.lang !== locale;
      const topics = item.topics.slice(0,4).map((topic) => `<span>${escapeHtml(topic)}</span>`).join("");
      return `<a class="ktr-search-result" href="${escapeHtml(item.url)}">
        <div>
          <div class="ktr-search-result-meta"><span class="ktr-search-type">${escapeHtml(type)}</span>${showLang ? `<span class="ktr-search-lang">${escapeHtml(langLabel)}</span>` : ""}</div>
          <h2>${escapeHtml(item.title)}</h2>
          <p>${escapeHtml(item.description)}</p>
          ${topics ? `<div class="ktr-search-topics">${topics}</div>` : ""}
        </div>
        <span class="ktr-search-result-arrow" aria-label="${escapeHtml(copy.open)}">→</span>
      </a>`;
    }).join("");
  }

  function syncUrl(query) {
    const url = new URL(window.location.href);
    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");
    history.replaceState({}, "", url);
  }

  function runSearch(query, updateUrl = true) {
    const clean = query.trim();
    if (updateUrl) syncUrl(clean);
    displayRecords(clean);
  }

  function buildFilters() {
    const available = ["all", ...new Set(records.filter((r) => r.lang === locale || r.lang === "und" || r.type === "tool" || r.type === "creative").map((r) => r.type))];
    filterWrap.innerHTML = available.map((type) => `<button type="button" class="ktr-search-filter${type === "all" ? " is-active" : ""}" data-filter="${escapeHtml(type)}">${escapeHtml(type === "all" ? copy.all : (copy.types[type] || type))}</button>`).join("");
    filterWrap.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      activeFilter = button.dataset.filter;
      [...filterWrap.querySelectorAll("[data-filter]")].forEach((item) => item.classList.toggle("is-active", item === button));
      displayRecords(input.value.trim());
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    runSearch(input.value);
  });

  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => runSearch(input.value), 110);
  });

  chips.forEach((chip) => chip.addEventListener("click", () => {
    input.value = chip.dataset.searchChip || chip.textContent.trim();
    input.focus();
    runSearch(input.value);
  }));

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const editing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
    if ((event.key === "/" && !editing) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")) {
      event.preventDefault();
      input.focus();
      input.select();
    }
    if (event.key === "Escape" && document.activeElement === input) {
      input.value = "";
      runSearch("");
      input.blur();
    }
  });

  status.textContent = copy.searching;
  fetch("/assets/search-index.json", {cache:"no-cache"})
    .then((response) => {
      if (!response.ok) throw new Error(`Search index ${response.status}`);
      return response.json();
    })
    .then((payload) => {
      records = Array.isArray(payload.records) ? payload.records : [];
      buildFilters();
      const initial = new URL(window.location.href).searchParams.get("q") || "";
      input.value = initial;
      displayRecords(initial);
      if (initial) input.focus();
    })
    .catch(() => {
      status.textContent = locale === "vi" ? "Không thể tải dữ liệu tìm kiếm." : "The search index could not be loaded.";
      resultsEl.innerHTML = `<div class="ktr-search-empty"><h2>${escapeHtml(copy.emptyTitle)}</h2><p>${escapeHtml(copy.emptyBody)}</p></div>`;
    });
})();
