/**
 * M-LAB: Asosiy dastur mantig'i (O'zbek, Rus va Ingliz tillari 100% qo'llab-quvvatlanadi)
 * 108+ ta to'liq darslar bazasi, 3 xil tushuntirilgan misollar, 3 tadan mustaqil amaliy mashqlar
 * va maxsus TEST GENERATOR (Sinf, mavzular va savollar sonini tanlab test tuzish va topshirish tizimi).
 */

function safeRenderMath(element) {
  if (typeof renderMathInElement === "function") {
    try {
      renderMathInElement(element || document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ],
        throwOnError: false
      });
    } catch (e) {
      console.warn("KaTeX render error:", e);
    }
  }
}

function formatMathText(str) {
  if (!str) return "";
  let text = String(str).trim();
  if (text.includes("\\(") || text.includes("\\[")) return text;
  if (/((\\[a-zA-Z]+)|(\^)|(_)|(\d+\s*[\+\-\*\/]\s*\d+))/.test(text)) {
    if (text.includes(":")) {
      const parts = text.split(":");
      return `${parts[0]}: \\(${parts.slice(1).join(":").trim()}\\)`;
    }
    return `\\(${text}\\)`;
  }
  return text;
}

// Ilova holati (State)
const AppState = {
  lang: localStorage.getItem("m_lab_lang") || "uz", // 'uz' | 'ru' | 'en'
  currentView: "lesson", // 'lesson' | 'test_wizard' | 'test_runner' | 'test_results'
  currentTopicId: "kasrlar-oddiy",
  activeGrade: "all", // 'all' | '5' | '6' | '7' | '8' | '9' | '10' | '11'
  activeCategory: "all", // 'all' | 'algebra' | 'geometriya' | 'favorites'
  activeExampleLevelIndex: 0, // 0: basic, 1: medium, 2: hard
  activePracticeIndex: 0, // 0: basic practice, 1: medium practice, 2: hard practice
  revealedPracticeSolutions: {}, // { "topicId_0": true, ... }
  completedPracticeMap: {}, // { "topicId_0": true, ... }
  searchQuery: "",
  favorites: new Set(),
  theme: "light",

  // Test Generator State
  testWizard: {
    grade: "all",
    selectedTopicIds: new Set(),
    questionCount: 10
  },
  activeTest: {
    questions: [],
    currentIndex: 0,
    answers: {}, // { 0: chosenIdx, 1: chosenIdx }
    startTime: null,
    endTime: null
  }
};

// ==========================================
// DASTUR BOSHLANISHI (INITIALIZATION)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initFavorites();
  initLanguageUI();
  initEventListeners();

  // Test wizard uchun barcha mavzularni dastlab tanlab qo'yish
  selectAllTopicsForTestWizard();

  // URL hash orqali mavzuni yuklash
  const hash = window.location.hash.replace("#", "");
  if (hash === "test-generator") {
    openTestWizard();
  } else if (hash && mathTopicsData.some(t => t.id === hash)) {
    AppState.currentTopicId = hash;
    const found = mathTopicsData.find(t => t.id === hash);
    if (found) {
      AppState.activeGrade = String(found.gradeNumber);
    }
    renderMainView();
  } else {
    AppState.currentTopicId = mathTopicsData[0]?.id || "kasrlar-oddiy";
    renderMainView();
  }

  updateStaticI18nLabels();
  renderGradeButtons();
  renderSidebarList();
  updateCounts();
});

// ==========================================
// ASOSIY KO'RINISHNI BOSHQARISH (VIEW ROUTER)
// ==========================================
function renderMainView() {
  const sidebar = document.getElementById("app-sidebar");
  const gradesBar = document.getElementById("grades-filter-container")?.parentElement;
  const navTestBtn = document.getElementById("nav-test-generator-btn");

  if (AppState.currentView === "lesson") {
    if (sidebar) sidebar.classList.remove("hidden");
    if (gradesBar) gradesBar.style.display = "block";
    if (navTestBtn) {
      navTestBtn.className = "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-600 hover:text-white flex items-center space-x-1.5 shadow-2xs";
      navTestBtn.innerHTML = `<i data-lucide="file-question" class="w-4 h-4"></i><span>${t("nav_test_builder", AppState.lang)}</span>`;
    }
    renderTopicDetail(AppState.currentTopicId);
  } else if (AppState.currentView === "test_wizard") {
    if (navTestBtn) {
      navTestBtn.className = "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all bg-brand-600 text-white shadow-xs flex items-center space-x-1.5";
      navTestBtn.innerHTML = `<i data-lucide="book-open" class="w-4 h-4"></i><span>${t("nav_lessons", AppState.lang)}</span>`;
    }
    renderTestWizard();
  } else if (AppState.currentView === "test_runner") {
    renderTestRunner();
  } else if (AppState.currentView === "test_results") {
    renderTestResults();
  }
  refreshLucide();
}

function openTestWizard() {
  AppState.currentView = "test_wizard";
  window.location.hash = "test-generator";
  selectAllTopicsForTestWizard();
  renderMainView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToLessons() {
  AppState.currentView = "lesson";
  window.location.hash = AppState.currentTopicId;
  renderMainView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// TIL VA LOKALIZATSIYA FUNKSIYALARI (i18n)
// ==========================================
function initLanguageUI() {
  document.querySelectorAll(".lang-pill-btn").forEach(btn => {
    const l = btn.getAttribute("data-lang");
    if (l === AppState.lang) {
      btn.className = "lang-pill-btn px-2.5 py-1 rounded-lg text-xs font-black transition-all bg-brand-600 text-white shadow-xs";
    } else {
      btn.className = "lang-pill-btn px-2.5 py-1 rounded-lg text-xs font-black transition-all text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white";
    }
  });
}

function setLanguage(lang) {
  if (AppState.lang === lang) return;
  AppState.lang = lang;
  localStorage.setItem("m_lab_lang", lang);

  initLanguageUI();
  updateStaticI18nLabels();
  renderGradeButtons();
  renderSidebarList();
  renderMainView();

  const langNames = {
    uz: "Til o'zgartirildi: O'zbekcha 🇺🇿",
    ru: "Язык изменен: Русский 🇷🇺",
    en: "Language switched: English 🇬🇧"
  };
  showToast(langNames[lang] || "Language changed", "info");
}

function getLocalizedTopic(topic) {
  const l = AppState.lang;
  if (topic[l]) {
    const loc = topic[l];
    const exs = loc.examples || (loc.example ? [loc.example] : topic.examples || [topic.example]);
    const pExs = loc.practiceExercises || topic.practiceExercises || [];
    return {
      ...topic,
      title: loc.title || topic.title,
      shortDesc: loc.shortDesc || topic.shortDesc,
      description: loc.description || topic.description,
      formulas: loc.formulas || topic.formulas,
      steps: loc.steps || topic.steps,
      examples: exs,
      example: exs[AppState.activeExampleLevelIndex] || exs[0] || loc.example || topic.example,
      practiceExercises: pExs,
      practiceExercise: pExs[AppState.activePracticeIndex] || pExs[0]
    };
  }
  return topic;
}

function getGradeLabel(gradeNumber) {
  if (AppState.lang === "ru") return `${gradeNumber} класс`;
  if (AppState.lang === "en") return `Grade ${gradeNumber}`;
  return `${gradeNumber}-sinf`;
}

function updateStaticI18nLabels() {
  const l = AppState.lang;
  const brandTitle = document.getElementById("brand-title");
  const brandBadge = document.getElementById("brand-badge");
  const brandSubtitle = document.getElementById("brand-subtitle");
  const searchInput = document.getElementById("search-input");
  const sidebarMobileTitle = document.getElementById("sidebar-mobile-title");

  const tabCatAll = document.getElementById("tab-cat-all");
  const tabCatAlg = document.getElementById("tab-cat-algebra");
  const tabCatGeo = document.getElementById("tab-cat-geometriya");

  if (brandTitle) brandTitle.textContent = t("brand_title", l);
  if (brandBadge) brandBadge.textContent = t("brand_badge", l);
  if (brandSubtitle) brandSubtitle.textContent = t("brand_subtitle", l);
  if (searchInput) searchInput.placeholder = t("search_placeholder", l);
  if (sidebarMobileTitle) sidebarMobileTitle.textContent = t("all_categories", l) + " " + t("items_count", l);

  if (tabCatAll) tabCatAll.textContent = t("all_categories", l);
  if (tabCatAlg) tabCatAlg.textContent = t("algebra", l);
  if (tabCatGeo) tabCatGeo.textContent = t("geometriya", l);
}

function renderGradeButtons() {
  const container = document.getElementById("grades-filter-container");
  if (!container) return;

  const l = AppState.lang;
  const grades = [5, 6, 7, 8, 9, 10, 11];

  let html = `
    <span class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1 flex items-center space-x-1">
      <i data-lucide="graduation-cap" class="w-3.5 h-3.5"></i>
      <span>${t("select_grade_label", l)}</span>
    </span>
    
    <button class="grade-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
      AppState.activeGrade === 'all' 
        ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20' 
        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-600 dark:hover:text-brand-400'
    }" data-grade="all">
      ${t("all_grades", l)} (<span id="count-all-grades">${mathTopicsData.length}</span>)
    </button>
  `;

  grades.forEach(g => {
    const isAct = AppState.activeGrade === String(g);
    html += `
      <button class="grade-filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
        isAct 
          ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20' 
          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-600 dark:hover:text-brand-400'
      }" data-grade="${g}">
        ${getGradeLabel(g)}
      </button>
    `;
  });

  container.innerHTML = html;

  container.querySelectorAll(".grade-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const grade = btn.getAttribute("data-grade");
      AppState.activeGrade = grade;
      renderGradeButtons();

      const filtered = getFilteredTopics();
      if (filtered.length > 0 && !filtered.some(t => t.id === AppState.currentTopicId)) {
        selectTopic(filtered[0].id);
      } else {
        renderSidebarList();
      }
    });
  });

  refreshLucide();
}

// ==========================================
// TEMA BOSHQARUVI (DARK / LIGHT MODE)
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem("m_lab_theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add("dark");
    AppState.theme = "dark";
  } else {
    document.documentElement.classList.remove("dark");
    AppState.theme = "light";
  }
}

function toggleTheme() {
  if (document.documentElement.classList.contains("dark")) {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("m_lab_theme", "light");
    AppState.theme = "light";
  } else {
    document.documentElement.classList.add("dark");
    localStorage.setItem("m_lab_theme", "dark");
    AppState.theme = "dark";
  }
  refreshLucide();
}

// ==========================================
// SEVIMLILARNI BOSHQARISH (FAVORITES)
// ==========================================
function initFavorites() {
  try {
    const saved = localStorage.getItem("m_lab_favorites");
    if (saved) {
      const arr = JSON.parse(saved);
      AppState.favorites = new Set(arr);
    }
  } catch (e) {
    AppState.favorites = new Set();
  }
  updateFavBadge();
}

function toggleFavorite(topicId, e) {
  if (e) e.stopPropagation();

  const l = AppState.lang;
  if (AppState.favorites.has(topicId)) {
    AppState.favorites.delete(topicId);
    showToast(l === "ru" ? "Удалено из избранного" : l === "en" ? "Removed from bookmarks" : "Sevimlilardan olib tashlandi", "info");
  } else {
    AppState.favorites.add(topicId);
    showToast(l === "ru" ? "Сохранено в избранное ⭐" : l === "en" ? "Saved to bookmarks ⭐" : "Mavzu sevimlilarga saqlandi ⭐", "success");
  }

  localStorage.setItem("m_lab_favorites", JSON.stringify(Array.from(AppState.favorites)));
  updateFavBadge();
  renderSidebarList();

  const favBtn = document.getElementById("detail-fav-btn");
  if (favBtn && AppState.currentTopicId === topicId) {
    const isFav = AppState.favorites.has(topicId);
    const saveTxt = isFav ? t("saved_btn", l) : t("save_btn", l);
    favBtn.innerHTML = `
      <i data-lucide="${isFav ? 'bookmark-check' : 'bookmark'}" class="w-4 h-4 ${isFav ? 'text-amber-500 fill-amber-500' : ''}"></i>
      <span class="text-xs font-bold ${isFav ? 'text-amber-600 dark:text-amber-400' : ''}">${saveTxt}</span>
    `;
    refreshLucide();
  }
}

function updateFavBadge() {
  const badge = document.getElementById("fav-badge-count");
  if (!badge) return;
  const count = AppState.favorites.size;
  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove("hidden");
    badge.classList.add("flex");
  } else {
    badge.classList.add("hidden");
    badge.classList.remove("flex");
  }
}

function updateCounts() {
  const allCount = mathTopicsData.length;
  const allGradesBadge = document.getElementById("count-all-grades");
  if (allGradesBadge) allGradesBadge.textContent = allCount;
}

// ==========================================
// RO'YXATLAR VA FILTRLASH
// ==========================================
function getFilteredTopics() {
  return mathTopicsData.filter(rawTopic => {
    const topic = getLocalizedTopic(rawTopic);

    // Sinf filtri (5, 6, 7, 8, 9, 10, 11)
    if (AppState.activeGrade !== "all") {
      if (String(topic.gradeNumber) !== AppState.activeGrade) return false;
    }

    // Fan filtri (Algebra / Geometriya / Sevimlilar)
    if (AppState.activeCategory === "algebra" && topic.category !== "algebra") return false;
    if (AppState.activeCategory === "geometriya" && topic.category !== "geometriya") return false;
    if (AppState.activeCategory === "favorites" && !AppState.favorites.has(topic.id)) return false;

    // Qidiruv filtri
    if (AppState.searchQuery.trim()) {
      const q = AppState.searchQuery.toLowerCase().trim();
      const matchTitle = topic.title.toLowerCase().includes(q);
      const matchDesc = topic.description.toLowerCase().includes(q) || topic.shortDesc.toLowerCase().includes(q);
      const matchGrade = topic.grade.toLowerCase().includes(q);
      const matchFormulas = topic.formulas.some(f => f.title.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchGrade || matchFormulas;
    }

    return true;
  });
}

// ==========================================
// SIDEBAR MAVZULAR RO'YXATI
// ==========================================
function renderSidebarList() {
  const container = document.getElementById("topic-list-container");
  if (!container) return;

  const l = AppState.lang;
  const topics = getFilteredTopics();

  // Status panelini yangilash
  const statusText = document.getElementById("filter-status-text");
  const topicsCountBadge = document.getElementById("filter-topics-count");
  if (statusText && topicsCountBadge) {
    let text = AppState.activeGrade === "all" ? t("all_grades", l) : getGradeLabel(AppState.activeGrade);
    if (AppState.activeCategory === "algebra") text += ` (${t("algebra", l)})`;
    if (AppState.activeCategory === "geometriya") text += ` (${t("geometriya", l)})`;
    if (AppState.activeCategory === "favorites") text = `⭐ ${t("favorites_title", l)}`;
    statusText.textContent = text;
    topicsCountBadge.textContent = `${topics.length} ${t("items_count", l)}`;
  }

  if (topics.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 px-4 text-slate-400 dark:text-slate-500">
        <i data-lucide="search-x" class="w-8 h-8 mx-auto mb-2 opacity-60"></i>
        <p class="text-xs font-semibold">${t("no_topics_found", l)}</p>
        <button id="reset-filters-btn" class="mt-3 px-3 py-1.5 text-xs font-bold rounded-lg bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-400 hover:bg-brand-100 transition">
          ${t("show_all_topics", l)}
        </button>
      </div>
    `;
    document.getElementById("reset-filters-btn")?.addEventListener("click", () => {
      AppState.activeGrade = "all";
      AppState.activeCategory = "all";
      AppState.searchQuery = "";
      const sInput = document.getElementById("search-input");
      if (sInput) sInput.value = "";
      renderGradeButtons();
      updateCategoryButtonsUI();
      renderSidebarList();
    });
    refreshLucide();
    return;
  }

  container.innerHTML = topics.map(rawTopic => {
    const topic = getLocalizedTopic(rawTopic);
    const isSelected = topic.id === AppState.currentTopicId && AppState.currentView === "lesson";
    const isFav = AppState.favorites.has(topic.id);
    const isAlgebra = topic.category === "algebra";
    const catLabel = topic.category === "algebra" ? t("algebra", l) : t("geometriya", l);

    return `
      <div 
        class="topic-sidebar-item group relative flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 font-medium' 
            : 'bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/60'
        }"
        data-topic-id="${topic.id}"
      >
        <div class="flex items-center space-x-3 min-w-0 flex-1">
          <div class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isSelected 
              ? 'bg-white/20 text-white' 
              : isAlgebra 
                ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400' 
                : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
          }">
            <i data-lucide="${topic.icon || 'book'}" class="w-4 h-4"></i>
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="text-xs font-bold truncate leading-tight ${isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'}">
              ${topic.title}
            </h4>
            <div class="flex items-center space-x-1.5 mt-0.5">
              <span class="text-[10px] font-bold px-1.5 py-0.2 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}">
                ${getGradeLabel(topic.gradeNumber)}
              </span>
              <span class="text-[9px] opacity-40">•</span>
              <span class="text-[10px] capitalize opacity-75">
                ${catLabel}
              </span>
            </div>
          </div>
        </div>

        <button 
          class="fav-toggle-btn p-1.5 rounded-lg opacity-80 hover:opacity-100 hover:scale-110 transition ml-2 flex-shrink-0 ${
            isSelected ? 'text-white/80 hover:text-white' : isFav ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
          }"
          data-fav-id="${topic.id}"
          title="${isFav ? t('saved_btn', l) : t('save_btn', l)}"
        >
          <i data-lucide="bookmark" class="w-4 h-4 ${isFav ? 'fill-amber-500 text-amber-500' : ''}"></i>
        </button>
      </div>
    `;
  }).join("");

  container.querySelectorAll(".topic-sidebar-item").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-topic-id");
      selectTopic(id);
      closeMobileSidebar();
    });
  });

  container.querySelectorAll(".fav-toggle-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = btn.getAttribute("data-fav-id");
      toggleFavorite(id, e);
    });
  });

  refreshLucide();
}

function selectTopic(topicId) {
  AppState.currentView = "lesson";
  AppState.currentTopicId = topicId;
  window.location.hash = topicId;
  AppState.activeExampleLevelIndex = 0;
  AppState.activePracticeIndex = 0;

  renderSidebarList();
  renderMainView();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// MISOLLARNING BOSQICHMA-BOSQICH YECHILISHI (TEPASIDA TUSHUNTIRISH, PASTIDA MISOLLAR)
// ==========================================
function renderSolutionSteps(example) {
  const l = AppState.lang;
  if (example && example.solutionSteps && example.solutionSteps.length > 0) {
    return example.solutionSteps.map((step, idx) => {
      const stepColor = idx === 0 
        ? 'bg-emerald-600 text-white' 
        : idx === 1 
          ? 'bg-amber-600 text-white' 
          : 'bg-indigo-600 text-white';

      const stepHeadingBadge = idx === 0
        ? '🟢 1-bosqich: Birinchi nima qilamiz?'
        : idx === 1
          ? '🟡 2-bosqich: Ikkinchi nima qilamiz?'
          : '🔴 3-bosqich: Uchinchi nima qilamiz & Natija';

      return `
        <div class="solution-step-card bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 sm:p-5 transition-all shadow-xs space-y-3.5">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center space-x-3">
              <span class="w-7 h-7 rounded-xl ${stepColor} text-xs font-black flex items-center justify-center flex-shrink-0 shadow-xs">
                ${step.stepNumber}
              </span>
              <div>
                <h5 class="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  ${step.title}
                </h5>
              </div>
            </div>
            <span class="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-750 text-slate-700 dark:text-slate-300">
              ${stepHeadingBadge}
            </span>
          </div>

          <!-- TEPASIDA: O'qituvchi tili bilan qisqa va oson tushuntirish -->
          <div class="p-3.5 rounded-xl bg-amber-500/10 dark:bg-slate-750 border border-amber-200/60 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium flex items-start space-x-2.5">
            <span class="text-base flex-shrink-0">🗣️</span>
            <div>
              <strong class="text-amber-800 dark:text-amber-300 block mb-0.5 text-xs font-extrabold">O'qituvchi maslahati:</strong>
              <span>${step.why}</span>
            </div>
          </div>

          <!-- PASTIDA: Aniq misol va formulasi -->
          ${step.formula ? `
            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-indigo-200/80 dark:border-indigo-900/60 space-y-1">
              <span class="text-[11px] font-extrabold uppercase tracking-wide text-indigo-700 dark:text-indigo-400 block">
                📐 Misoldagi amaliy ko'rinishi:
              </span>
              <div class="py-1 text-center text-xs sm:text-base text-indigo-600 dark:text-indigo-300 font-bold overflow-x-auto">
                \\[${step.formula}\\]
              </div>
            </div>
          ` : ''}

          <!-- Qanday bajarildi / Natijasi -->
          <div class="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 font-bold flex items-center space-x-2">
            <span>✅</span>
            <span>${step.how}</span>
          </div>
        </div>
      `;
    }).join("");
  }
  return "";
}

// ==========================================
// ASOSIY MAVZU TAFSILOTI RENDER
// ==========================================
function renderTopicDetail(topicId) {
  const container = document.getElementById("topic-detail-card");
  if (!container) return;

  const l = AppState.lang;
  const rawTopic = mathTopicsData.find(t => t.id === topicId) || mathTopicsData[0];
  if (!rawTopic) return;

  const topic = getLocalizedTopic(rawTopic);
  const isFav = AppState.favorites.has(topic.id);
  const isAlgebra = topic.category === "algebra";
  const catLabel = topic.category === "algebra" ? t("algebra", l) : t("geometriya", l);

  const currentGradeTopics = getFilteredTopics();
  const currentIndex = currentGradeTopics.findIndex(t => t.id === topic.id);
  const prevTopic = currentIndex > 0 ? currentGradeTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex >= 0 && currentIndex < currentGradeTopics.length - 1 ? currentGradeTopics[currentIndex + 1] : null;

  const calcConfig = typeof topicCalculators !== "undefined" ? topicCalculators[topic.calculatorType] : null;
  const svgHtml = topic.svgType && typeof svgTemplates !== "undefined" && svgTemplates[topic.svgType] ? svgTemplates[topic.svgType]() : "";

  // Examples array with levels
  const examplesList = topic.examples || [topic.example];
  const currentExample = examplesList[AppState.activeExampleLevelIndex] || examplesList[0];

  // 3 Practice Exercises
  const practiceList = topic.practiceExercises || [];
  const currentPractice = practiceList[AppState.activePracticeIndex] || practiceList[0] || currentExample;
  const practiceKey = `${topic.id}_${AppState.activePracticeIndex}`;
  const isRevealed = AppState.revealedPracticeSolutions[practiceKey];
  const isDone = AppState.completedPracticeMap[practiceKey];

  let html = `
    <!-- 1. Header (Title, Grade, Actions) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-700/80">
      <div>
        <div class="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
          <span class="px-3 py-1 rounded-xl text-xs font-extrabold bg-amber-500 text-white shadow-xs">
            🎓 ${getGradeLabel(topic.gradeNumber)}
          </span>
          <span class="px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider ${
            isAlgebra 
              ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' 
              : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
          }">
            ${catLabel}
          </span>
        </div>
        <h1 class="text-2xl sm:text-3.5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          ${topic.title}
        </h1>
        <p class="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed max-w-2xl">
          ${topic.shortDesc}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center space-x-2 flex-wrap gap-y-2">
        <button 
          id="detail-fav-btn" 
          class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition text-slate-700 dark:text-slate-200 shadow-2xs"
          title="${t('save_btn', l)}"
        >
          <i data-lucide="${isFav ? 'bookmark-check' : 'bookmark'}" class="w-4 h-4 ${isFav ? 'text-amber-500 fill-amber-500' : ''}"></i>
          <span class="text-xs font-bold ${isFav ? 'text-amber-600 dark:text-amber-400' : ''}">${isFav ? t('saved_btn', l) : t('save_btn', l)}</span>
        </button>

        <button 
          id="detail-share-btn" 
          class="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition text-slate-700 dark:text-slate-200 shadow-2xs"
          title="${t('share_btn', l)}"
        >
          <i data-lucide="share-2" class="w-4 h-4"></i>
          <span class="text-xs font-bold">${t('share_btn', l)}</span>
        </button>
      </div>
    </div>

    <!-- 2. Oddiy qilib aytganda nima bu? (Explanation & Visual SVG) -->
    <div class="grid grid-cols-1 ${svgHtml ? 'lg:grid-cols-3' : ''} gap-6 items-center">
      <div class="${svgHtml ? 'lg:col-span-2' : ''} space-y-3">
        <div class="flex items-center space-x-2">
          <span class="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold text-sm">💡</span>
          <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            ${t('what_is_this_title', l)}
          </h3>
        </div>
        <div class="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-slate-800/90 border border-amber-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed font-medium">
          ${topic.description}
        </div>
      </div>
      ${svgHtml ? `<div class="lg:col-span-1">${svgHtml}</div>` : ''}
    </div>

    <!-- 3. Asosiy Formulalar -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <span class="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold text-sm">✨</span>
          <span>${t('formulas_title', l)}</span>
        </h3>
        <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">${t('click_to_copy', l)}</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${topic.formulas.map(formula => `
          <div class="formula-card relative p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-800/90 dark:to-indigo-950/30 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between group">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">${formula.title}</span>
                <button 
                  class="copy-formula-btn p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-slate-700 transition"
                  data-latex="${escapeHtml(formula.latex)}"
                  title="${t('click_to_copy', l)}"
                >
                  <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                </button>
              </div>
              <div class="py-2.5 text-center text-slate-900 dark:text-white font-medium text-lg formula-latex">
                \\[${formula.latex}\\]
              </div>
            </div>
            <div class="mt-2 border-t border-slate-200/60 dark:border-slate-700/60 pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              ${formula.desc}
            </div>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- 4. Formulaning amalda qo'llanilishi: Bosqichma-bosqich misol yechish -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <span class="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold text-sm">📌</span>
          <span>Formulaning amalda qo'llanilishi — Bosqichma-bosqich misol</span>
        </h3>
        <span class="text-xs text-amber-700 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-950/70 px-2.5 py-1 rounded-xl self-start sm:self-auto">
          1, 2, 3-bosqichli oson yo'riqnoma
        </span>
      </div>

      <!-- Problem Variations Tabs (Oddiy / O'rtacha / Qiyin) -->
      ${examplesList.length > 1 ? `
        <div class="flex items-center space-x-2 p-1.5 bg-slate-200/70 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-none" id="example-level-tabs">
          ${examplesList.map((ex, exIdx) => {
            const isLevelActive = exIdx === AppState.activeExampleLevelIndex;
            const levelLabel = exIdx === 0 ? "🟢 1-tur: Oddiy misol" : exIdx === 1 ? "🟡 2-tur: O'rtacha misol" : "🔴 3-tur: Qiyinroq misol";
            const activeColorClass = exIdx === 0 
              ? 'bg-emerald-600 text-white shadow-sm' 
              : exIdx === 1 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'bg-rose-600 text-white shadow-sm';
            return `
              <button 
                class="example-level-tab-btn flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-black transition-all text-center ${
                  isLevelActive 
                    ? activeColorClass 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-brand-600 dark:hover:text-white font-bold'
                }"
                data-example-index="${exIdx}"
              >
                ${levelLabel}
              </button>
            `;
          }).join("")}
        </div>
      ` : ''}

      <!-- Active Example Container -->
      <div class="p-5 sm:p-6 rounded-2xl bg-amber-50/40 dark:bg-slate-800/60 border border-amber-200/80 dark:border-slate-700 space-y-4 animate-fadeIn" id="current-example-wrapper">
        <div class="flex items-start justify-between gap-3">
          <div>
            <span class="inline-block text-[11px] font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2.5 py-0.5 rounded-md mb-1.5">
              ${currentExample.title}
            </span>
            <div class="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
              ${formatMathText(currentExample.problem)}
            </div>
          </div>
        </div>

        <!-- 3 Bosqichli Mukammal Yo'riqnoma -->
        <div class="pt-4 border-t border-amber-200/60 dark:border-slate-700 space-y-3">
          <div class="text-xs font-black uppercase tracking-wider text-amber-950 dark:text-amber-300 flex items-center space-x-1.5">
            <span>👇 Misolni yechish bosqichlari (1, 2, 3 va Natija):</span>
          </div>

          <div class="space-y-3" id="solution-steps-list">
            ${renderSolutionSteps(currentExample)}
          </div>
        </div>
      </div>
    </div>

    <!-- 6. Interaktiv Hisoblagich / Kalkulyator -->
    ${calcConfig ? `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-sm">⚡️</span>
            <span>${t('calc_heading', l)}</span>
          </h3>
          <span class="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            ${t('live_calc_badge', l)}
          </span>
        </div>

        <div id="calculator-widget-container" class="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h4 class="text-sm font-bold text-slate-800 dark:text-white mb-3">
            ${calcConfig.title}
          </h4>
          ${calcConfig.renderForm()}
        </div>
      </div>
    ` : ''}

    <!-- 7. O'zingiz mustaqil ishlang (3 ta Amaliy Misol) -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <span class="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold text-sm">✍️</span>
          <span>${t('practice_heading', l)}</span>
        </h3>
        
        <span class="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
          📝 ${t('practice_badge', l)}
        </span>
      </div>

      <!-- 3 Practice Tabs -->
      ${practiceList.length > 1 ? `
        <div class="flex items-center space-x-2 p-1.5 bg-slate-200/70 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-none" id="practice-exercise-tabs">
          ${practiceList.map((p, pIdx) => {
            const isPActive = pIdx === AppState.activePracticeIndex;
            const pKey = `${topic.id}_${pIdx}`;
            const pDone = AppState.completedPracticeMap[pKey];
            const pLabel = pIdx === 0 ? t('practice_q1_tab', l) : pIdx === 1 ? t('practice_q2_tab', l) : t('practice_q3_tab', l);
            const statusBadge = pDone ? ' ✅' : '';
            return `
              <button 
                class="practice-exercise-tab-btn flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-black transition-all text-center ${
                  isPActive 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-purple-600 dark:hover:text-white font-bold'
                }"
                data-practice-index="${pIdx}"
              >
                ${pLabel}${statusBadge}
              </button>
            `;
          }).join("")}
        </div>
      ` : ''}

      <!-- Active Practice Exercise Card -->
      <div class="p-5 sm:p-6 rounded-2xl bg-purple-50/40 dark:bg-slate-800/70 border border-purple-200/80 dark:border-slate-700 space-y-4 animate-fadeIn">
        <div class="flex items-center justify-between">
          <span class="inline-block text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 px-2.5 py-0.5 rounded-md">
            ${currentPractice.title}
          </span>
          ${isDone ? `
            <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md flex items-center space-x-1">
              <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
              <span>${t('practice_done_badge', l)}</span>
            </span>
          ` : ''}
        </div>

        <div class="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
          ${formatMathText(currentPractice.problem)}
        </div>

        <!-- Hint block -->
        <div class="p-3.5 rounded-xl bg-amber-500/10 dark:bg-slate-750 border border-amber-300/40 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-start space-x-2">
          <span class="font-bold text-amber-600 dark:text-amber-400 flex-shrink-0">${t('practice_hint_title', l)}</span>
          <span class="font-medium">${formatMathText(currentPractice.hint)}</span>
        </div>

        <!-- Reveal solution & mark done actions -->
        <div class="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-purple-200/50 dark:border-slate-700">
          <button 
            id="toggle-practice-solution-btn" 
            class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white transition shadow-sm flex items-center space-x-2"
          >
            <span>${isRevealed ? t('practice_hide_btn', l) : t('practice_reveal_btn', l)}</span>
          </button>

          <button 
            id="mark-practice-done-btn" 
            class="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
              isDone 
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' 
                : 'border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200'
            } transition flex items-center space-x-1.5"
          >
            <i data-lucide="${isDone ? 'check-circle-2' : 'check'}" class="w-4 h-4 ${isDone ? 'text-emerald-600' : ''}"></i>
            <span>${t('practice_done_btn', l)}</span>
          </button>
        </div>

        <!-- Revealed Solution Section -->
        <div id="practice-revealed-solution" class="${isRevealed ? '' : 'hidden'} space-y-3 pt-3 border-t border-purple-200/60 dark:border-slate-700 animate-fadeIn">
          <h5 class="text-xs font-extrabold uppercase tracking-wider text-purple-900 dark:text-purple-300">
            ${t('solution_steps_heading', l)}
          </h5>

          <div class="space-y-2.5">
            ${(currentPractice.solution?.steps || currentPractice.solutionSteps || []).map((step, sIdx) => `
              <div class="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-purple-200/70 dark:border-slate-700 space-y-1">
                <div class="flex items-center space-x-2">
                  <span class="w-5 h-5 rounded-md bg-purple-500 text-white font-black text-xs flex items-center justify-center">${sIdx + 1}</span>
                  <span class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">${step.title}</span>
                </div>
                ${step.formula ? `<div class="text-xs sm:text-sm text-indigo-600 dark:text-indigo-300 font-bold py-1">\\[${step.formula}\\]</div>` : ''}
                <div class="text-xs text-slate-600 dark:text-slate-300 font-medium">${formatMathText(step.why || step.explanation || step.how || '')}</div>
              </div>
            `).join("")}
          </div>

          <!-- Final Answer Banner -->
          <div class="p-3.5 rounded-xl bg-emerald-500/15 dark:bg-emerald-950/60 border border-emerald-400/50 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-bold flex items-center space-x-2">
            <span class="text-base">🎯</span>
            <span><strong>${t('practice_answer_heading', l)}</strong> ${formatMathText(currentPractice.solution?.answer || currentPractice.solutionSteps?.[currentPractice.solutionSteps?.length - 1]?.tip || 'Javob muvaffaqiyatli topildi.')}</span>
          </div>
        </div>

      </div>
    </div>

    <!-- 8. Oldingi / Keyingi mavzuga o'tish tugmalari -->
    <div class="pt-6 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
      ${prevTopic ? `
        <button 
          class="nav-topic-btn flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition text-left"
          data-nav-id="${prevTopic.id}"
        >
          <i data-lucide="chevron-left" class="w-4 h-4"></i>
          <div>
            <div class="text-[10px] text-slate-400 uppercase font-bold">${t('prev_topic_label', l)}</div>
            <div class="text-xs font-bold truncate max-w-[140px] sm:max-w-[200px]">${getLocalizedTopic(prevTopic).title}</div>
          </div>
        </button>
      ` : '<div></div>'}

      ${nextTopic ? `
        <button 
          class="nav-topic-btn flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition text-right shadow-sm ml-auto"
          data-nav-id="${nextTopic.id}"
        >
          <div>
            <div class="text-[10px] text-white/80 uppercase font-bold">${t('next_topic_label', l)}</div>
            <div class="text-xs font-bold truncate max-w-[140px] sm:max-w-[200px]">${getLocalizedTopic(nextTopic).title}</div>
          </div>
          <i data-lucide="chevron-right" class="w-4 h-4"></i>
        </button>
      ` : '<div></div>'}
    </div>
  `;

  container.innerHTML = html;

  // Level tabs listeners
  container.querySelectorAll(".example-level-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-example-index"), 10);
      AppState.activeExampleLevelIndex = idx;
      renderTopicDetail(topicId);
    });
  });

  // Practice tabs listeners
  container.querySelectorAll(".practice-exercise-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-practice-index"), 10);
      AppState.activePracticeIndex = idx;
      renderTopicDetail(topicId);
    });
  });

  // Toggle Practice Solution
  document.getElementById("toggle-practice-solution-btn")?.addEventListener("click", () => {
    const currentKey = `${topic.id}_${AppState.activePracticeIndex}`;
    AppState.revealedPracticeSolutions[currentKey] = !AppState.revealedPracticeSolutions[currentKey];
    renderTopicDetail(topicId);
  });

  // Mark Practice Done
  document.getElementById("mark-practice-done-btn")?.addEventListener("click", () => {
    const currentKey = `${topic.id}_${AppState.activePracticeIndex}`;
    AppState.completedPracticeMap[currentKey] = !AppState.completedPracticeMap[currentKey];
    if (AppState.completedPracticeMap[currentKey]) {
      showToast(t("practice_done_badge", l), "success");
    }
    renderTopicDetail(topicId);
  });

  // Step accordion
  container.querySelectorAll(".step-card").forEach(card => {
    const header = card.querySelector(".step-toggle-header");
    const panel = card.querySelector(".super-simple-panel");
    const chevron = card.querySelector(".step-chevron");

    header?.addEventListener("click", () => {
      if (panel) {
        const isHidden = panel.classList.contains("hidden");
        if (isHidden) {
          panel.classList.remove("hidden");
          chevron?.classList.add("rotate-180");
        } else {
          panel.classList.add("hidden");
          chevron?.classList.remove("rotate-180");
        }
      }
    });
  });

  // Example solution steps accordion
  container.querySelectorAll(".solution-step-card").forEach(card => {
    const header = card.querySelector(".solution-step-header");
    const body = card.querySelector(".solution-step-body");
    const chevron = card.querySelector(".sol-chevron");

    header?.addEventListener("click", () => {
      if (body) {
        const isHidden = body.classList.contains("hidden");
        if (isHidden) {
          body.classList.remove("hidden");
          chevron?.classList.add("rotate-180");
        } else {
          body.classList.add("hidden");
          chevron?.classList.remove("rotate-180");
        }
      }
    });
  });

  // Toggle all solution steps button
  let allSolutionExpanded = false;
  document.getElementById("toggle-all-solution-btn")?.addEventListener("click", () => {
    allSolutionExpanded = !allSolutionExpanded;
    container.querySelectorAll(".solution-step-card").forEach(card => {
      const body = card.querySelector(".solution-step-body");
      const chevron = card.querySelector(".sol-chevron");
      if (body) {
        if (allSolutionExpanded) {
          body.classList.remove("hidden");
          chevron?.classList.add("rotate-180");
        } else {
          body.classList.add("hidden");
          chevron?.classList.remove("rotate-180");
        }
      }
    });
  });

  if (calcConfig) {
    const calcContainer = document.getElementById("calculator-widget-container");
    if (calcContainer) calcConfig.init(calcContainer);
  }

  container.querySelectorAll(".copy-formula-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const latex = btn.getAttribute("data-latex");
      copyToClipboard(latex, t("copied_toast", l));
    });
  });

  document.getElementById("detail-fav-btn")?.addEventListener("click", (e) => {
    toggleFavorite(topic.id, e);
  });

  document.getElementById("detail-share-btn")?.addEventListener("click", () => {
    const url = window.location.origin + window.location.pathname + "#" + topic.id;
    copyToClipboard(url, t("copied_toast", l));
  });

  container.querySelectorAll(".nav-topic-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-nav-id");
      if (targetId) selectTopic(targetId);
    });
  });

  safeRenderMath(container);
  refreshLucide();
}

// ==========================================
// TEST GENERATOR WIZARD (SOZLAMALAR PANELI)
// ==========================================
function selectAllTopicsForTestWizard() {
  const g = AppState.testWizard.grade;
  const filtered = mathTopicsData.filter(t => g === "all" || String(t.gradeNumber) === g);
  AppState.testWizard.selectedTopicIds = new Set(filtered.map(t => t.id));
}

function renderTestWizard() {
  const container = document.getElementById("topic-detail-card");
  if (!container) return;

  const l = AppState.lang;
  const grades = ["all", "5", "6", "7", "8", "9", "10", "11"];
  const availableTopics = mathTopicsData.filter(t => AppState.testWizard.grade === "all" || String(t.gradeNumber) === AppState.testWizard.grade);
  const selectedCount = AppState.testWizard.selectedTopicIds.size;

  let html = `
    <!-- Wizard Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-700/80">
      <div>
        <div class="flex items-center space-x-2 mb-2">
          <span class="px-3 py-1 rounded-xl text-xs font-extrabold bg-purple-600 text-white shadow-xs">
            ⚡️ ${t('nav_test_builder', l)}
          </span>
        </div>
        <h1 class="text-2xl sm:text-3.5xl font-black text-slate-900 dark:text-white tracking-tight">
          ${t('test_builder_title', l)}
        </h1>
        <p class="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed max-w-2xl">
          ${t('test_builder_subtitle', l)}
        </p>
      </div>

      <button id="wizard-back-to-lessons-btn" class="flex items-center space-x-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition">
        <i data-lucide="arrow-left" class="w-4 h-4"></i>
        <span>${t('back_to_lessons', l)}</span>
      </button>
    </div>

    <!-- Step 1: Grade Selection -->
    <div class="space-y-3">
      <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
        <span class="w-6 h-6 rounded-lg bg-brand-600 text-white text-xs font-bold flex items-center justify-center">1</span>
        <span>${t('step1_select_grade', l)}</span>
      </h3>
      <div class="flex flex-wrap gap-2">
        ${grades.map(g => {
          const isAct = AppState.testWizard.grade === g;
          const label = g === "all" ? t("all_grades", l) : getGradeLabel(g);
          return `
            <button 
              class="wizard-grade-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isAct 
                  ? 'bg-brand-600 text-white shadow-sm' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-slate-700'
              }" 
              data-grade="${g}"
            >
              ${label}
            </button>
          `;
        }).join("")}
      </div>
    </div>

    <!-- Step 2: Topics Checklist Selection -->
    <div class="space-y-3 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <span class="w-6 h-6 rounded-lg bg-purple-600 text-white text-xs font-bold flex items-center justify-center">2</span>
          <span>${t('step2_select_topics', l)}</span>
          <span class="text-xs text-purple-600 dark:text-purple-400 font-extrabold bg-purple-100 dark:bg-purple-950/70 px-2 py-0.5 rounded-lg">
            (${selectedCount} / ${availableTopics.length} ${t('selected_topics_count', l)})
          </span>
        </h3>

        <div class="flex items-center space-x-2">
          <button id="wizard-select-all-btn" class="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
            ${t('select_all_topics', l)}
          </button>
          <span class="text-slate-300 dark:text-slate-600">•</span>
          <button id="wizard-deselect-all-btn" class="text-xs font-bold text-slate-500 hover:underline">
            ${t('deselect_all_topics', l)}
          </button>
        </div>
      </div>

      <!-- Topics Checkbox Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700" id="wizard-topics-checkbox-container">
        ${availableTopics.map(rawTopic => {
          const locTopic = getLocalizedTopic(rawTopic);
          const isChecked = AppState.testWizard.selectedTopicIds.has(locTopic.id);
          return `
            <label class="flex items-center space-x-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
              isChecked 
                ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700' 
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
            }">
              <input 
                type="checkbox" 
                class="wizard-topic-checkbox w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500" 
                data-topic-id="${locTopic.id}"
                ${isChecked ? 'checked' : ''}
              />
              <div class="min-w-0 flex-1">
                <div class="text-xs font-bold truncate text-slate-900 dark:text-white">${locTopic.title}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400">${getGradeLabel(locTopic.gradeNumber)} • ${locTopic.category}</div>
              </div>
            </label>
          `;
        }).join("")}
      </div>
    </div>

    <!-- Step 3: Question Count Selection -->
    <div class="space-y-3 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
      <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
        <span class="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">3</span>
        <span>${t('step3_select_count', l)}</span>
      </h3>
      <div class="flex flex-wrap gap-2.5">
        ${[5, 10, 15, 20, 25].map(cnt => {
          const isAct = AppState.testWizard.questionCount === cnt;
          return `
            <button 
              class="wizard-count-btn px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
                isAct 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700'
              }" 
              data-count="${cnt}"
            >
              ${cnt} ta test
            </button>
          `;
        }).join("")}
      </div>
    </div>

    <!-- Action: Start Test Button -->
    <div class="pt-6 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
      <div class="text-xs font-semibold text-slate-500">
        Tanlandi: <strong class="text-slate-900 dark:text-white">${selectedCount} ta mavzu</strong>, <strong class="text-slate-900 dark:text-white">${AppState.testWizard.questionCount} ta savol</strong>
      </div>
      <button 
        id="wizard-start-test-btn" 
        class="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-600 hover:from-purple-700 hover:to-brand-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-purple-500/25 hover:scale-[1.02] transition transform flex items-center space-x-2"
      >
        <span>${t('start_test_btn', l)}</span>
        <i data-lucide="play" class="w-4 h-4 fill-white"></i>
      </button>
    </div>
  `;

  container.innerHTML = html;

  // Grade selection listeners
  container.querySelectorAll(".wizard-grade-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      AppState.testWizard.grade = btn.getAttribute("data-grade");
      selectAllTopicsForTestWizard();
      renderTestWizard();
    });
  });

  // Topics checkboxes listener
  container.querySelectorAll(".wizard-topic-checkbox").forEach(cb => {
    cb.addEventListener("change", () => {
      const id = cb.getAttribute("data-topic-id");
      if (cb.checked) {
        AppState.testWizard.selectedTopicIds.add(id);
      } else {
        AppState.testWizard.selectedTopicIds.delete(id);
      }
      renderTestWizard();
    });
  });

  // Select all / Deselect all
  document.getElementById("wizard-select-all-btn")?.addEventListener("click", () => {
    selectAllTopicsForTestWizard();
    renderTestWizard();
  });
  document.getElementById("wizard-deselect-all-btn")?.addEventListener("click", () => {
    AppState.testWizard.selectedTopicIds.clear();
    renderTestWizard();
  });

  // Count buttons
  container.querySelectorAll(".wizard-count-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      AppState.testWizard.questionCount = parseInt(btn.getAttribute("data-count"), 10);
      renderTestWizard();
    });
  });

  // Start test button
  document.getElementById("wizard-start-test-btn")?.addEventListener("click", startGeneratedTest);
  document.getElementById("wizard-back-to-lessons-btn")?.addEventListener("click", backToLessons);

  refreshLucide();
}

// ==========================================
// TESTNI GENERATSIYA QILISH VA ISHGA TUSHIRISH
// ==========================================
function startGeneratedTest() {
  const l = AppState.lang;
  const selectedIds = Array.from(AppState.testWizard.selectedTopicIds);

  if (selectedIds.length === 0) {
    showToast(t("no_topics_selected_alert", l), "error");
    return;
  }

  const selectedTopics = mathTopicsData.filter(t => selectedIds.includes(t.id));
  
  // Har bir tanlangan mavzuning savollarini guruhlaymiz
  const topicQuestionBuckets = selectedTopics.map(rawTopic => {
    const topic = getLocalizedTopic(rawTopic);
    const quizzes = (topic.quizzes || (topic.quiz ? [topic.quiz] : [])).map(q => ({
      topicId: topic.id,
      topicTitle: topic.title,
      gradeNumber: topic.gradeNumber,
      category: topic.category,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      level: q.level || "basic"
    }));
    return {
      topicId: topic.id,
      questions: quizzes.sort(() => Math.random() - 0.5)
    };
  });

  // Mavzular tartibini tasodifiy aralashtiramiz
  topicQuestionBuckets.sort(() => Math.random() - 0.5);

  const desiredCount = AppState.testWizard.questionCount;
  const finalQuestions = [];
  const seenQuestions = new Set();

  // Round-Robin (Har bir tanlangan mavzudan kamida 1 tadan turli darajadagi misol olish)
  let round = 0;
  let hasMoreQuestions = true;

  while (finalQuestions.length < desiredCount && hasMoreQuestions) {
    hasMoreQuestions = false;
    for (const bucket of topicQuestionBuckets) {
      if (finalQuestions.length >= desiredCount) break;

      if (round < bucket.questions.length) {
        const q = bucket.questions[round];
        const qText = q.question.trim();
        if (!seenQuestions.has(qText)) {
          seenQuestions.add(qText);
          finalQuestions.push(q);
        }
        hasMoreQuestions = true;
      }
    }
    round++;
  }

  // Yakuniy test savollarini aralashtiramiz (aralash qiziqarli tushishi uchun)
  finalQuestions.sort(() => Math.random() - 0.5);

  AppState.activeTest = {
    questions: finalQuestions,
    currentIndex: 0,
    answers: {},
    startTime: Date.now(),
    endTime: null
  };

  AppState.currentView = "test_runner";
  renderMainView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// TEST RUNNER (JONLI TEST TOPSHIRISH PANELI)
// ==========================================
function renderTestRunner() {
  const container = document.getElementById("topic-detail-card");
  if (!container) return;

  const l = AppState.lang;
  const test = AppState.activeTest;
  const total = test.questions.length;
  const currentQ = test.questions[test.currentIndex];
  const chosenAnswer = test.answers[test.currentIndex];

  const answeredCount = Object.keys(test.answers).length;
  const progressPercent = Math.round(((test.currentIndex + 1) / total) * 100);

  let html = `
    <!-- Test Runner Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-700/80">
      <div>
        <div class="flex items-center space-x-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-purple-600 text-white shadow-xs">
            ${t('test_progress_label', l)} ${test.currentIndex + 1} / ${total}
          </span>
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">
            ${currentQ.topicTitle} (${getGradeLabel(currentQ.gradeNumber)})
          </span>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <span class="text-xs font-bold text-slate-500">
          Javob berildi: <strong class="text-purple-600 dark:text-purple-400">${answeredCount} / ${total}</strong>
        </span>
        <button id="runner-finish-test-btn" class="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm">
          ${t('finish_test_btn', l)}
        </button>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
      <div class="bg-gradient-to-r from-purple-600 to-brand-600 h-2 rounded-full transition-all duration-300" style="width: ${progressPercent}%"></div>
    </div>

    <!-- Question Box -->
    <div class="p-6 sm:p-8 rounded-3xl bg-purple-50/30 dark:bg-slate-800/60 border border-purple-200/70 dark:border-slate-700 space-y-6">
      <div class="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
        ${currentQ.question}
      </div>

      <!-- Options List -->
      <div class="grid grid-cols-1 gap-3" id="runner-options-container">
        ${currentQ.options.map((opt, idx) => {
          const isSelected = chosenAnswer === idx;
          return `
            <button 
              class="runner-option-btn p-4 rounded-2xl border text-left text-sm sm:text-base font-semibold transition-all flex items-center space-x-3.5 ${
                isSelected 
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20 font-bold' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-400 text-slate-800 dark:text-slate-100'
              }"
              data-opt-index="${idx}"
            >
              <span class="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${
                isSelected 
                  ? 'bg-white text-purple-700' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }">
                ${String.fromCharCode(65 + idx)}
              </span>
              <span class="flex-1">${opt}</span>
            </button>
          `;
        }).join("")}
      </div>
    </div>

    <!-- Question Navigation Buttons -->
    <div class="flex items-center justify-between pt-4 border-t border-slate-200/80 dark:border-slate-700/80">
      <button 
        id="runner-prev-q-btn" 
        class="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition ${
          test.currentIndex === 0 ? 'opacity-40 pointer-events-none' : ''
        }"
      >
        <i data-lucide="chevron-left" class="w-4 h-4"></i>
        <span>${t('prev_question_btn', l)}</span>
      </button>

      <!-- Quick Question Selector Pills -->
      <div class="hidden md:flex items-center space-x-1.5 overflow-x-auto scrollbar-none px-2">
        ${test.questions.map((q, idx) => {
          const isCur = idx === test.currentIndex;
          const isAns = test.answers[idx] !== undefined;
          return `
            <button 
              class="runner-pill-btn w-7 h-7 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center ${
                isCur 
                  ? 'bg-purple-600 text-white ring-2 ring-purple-400' 
                  : isAns 
                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
              }"
              data-q-index="${idx}"
            >
              ${idx + 1}
            </button>
          `;
        }).join("")}
      </div>

      ${test.currentIndex < total - 1 ? `
        <button 
          id="runner-next-q-btn" 
          class="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm ml-auto"
        >
          <span>${t('next_question_btn', l)}</span>
          <i data-lucide="chevron-right" class="w-4 h-4"></i>
        </button>
      ` : `
        <button 
          id="runner-complete-test-btn" 
          class="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition shadow-sm ml-auto"
        >
          <span>${t('finish_test_btn', l)}</span>
          <i data-lucide="check-circle" class="w-4 h-4"></i>
        </button>
      `}
    </div>
  `;

  container.innerHTML = html;

  // Options click
  container.querySelectorAll(".runner-option-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const optIdx = parseInt(btn.getAttribute("data-opt-index"), 10);
      test.answers[test.currentIndex] = optIdx;
      renderTestRunner();
    });
  });

  // Nav actions
  document.getElementById("runner-prev-q-btn")?.addEventListener("click", () => {
    if (test.currentIndex > 0) {
      test.currentIndex--;
      renderTestRunner();
    }
  });

  document.getElementById("runner-next-q-btn")?.addEventListener("click", () => {
    if (test.currentIndex < total - 1) {
      test.currentIndex++;
      renderTestRunner();
    }
  });

  document.getElementById("runner-finish-test-btn")?.addEventListener("click", finishTest);
  document.getElementById("runner-complete-test-btn")?.addEventListener("click", finishTest);

  container.querySelectorAll(".runner-pill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      test.currentIndex = parseInt(btn.getAttribute("data-q-index"), 10);
      renderTestRunner();
    });
  });

  safeRenderMath(container);
  refreshLucide();
}

// ==========================================
// TESTNI YAKUNLASH VA NATIJALARNI KO'RSATISH
// ==========================================
function finishTest() {
  AppState.activeTest.endTime = Date.now();
  AppState.currentView = "test_results";
  renderMainView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderTestResults() {
  const container = document.getElementById("topic-detail-card");
  if (!container) return;

  const l = AppState.lang;
  const test = AppState.activeTest;
  const total = test.questions.length;

  let correctCount = 0;
  test.questions.forEach((q, idx) => {
    if (test.answers[idx] === q.correctIndex) {
      correctCount++;
    }
  });

  const percent = Math.round((correctCount / total) * 100);
  let gradeBadge = t('test_grade_excellent', l);
  let gradeBg = "from-emerald-500 to-teal-600";

  if (percent < 55) {
    gradeBadge = t('test_grade_poor', l);
    gradeBg = "from-red-500 to-rose-600";
  } else if (percent < 70) {
    gradeBadge = t('test_grade_fair', l);
    gradeBg = "from-amber-500 to-orange-600";
  } else if (percent < 86) {
    gradeBadge = t('test_grade_good', l);
    gradeBg = "from-indigo-500 to-purple-600";
  }

  let html = `
    <!-- Results Header / Score Card -->
    <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-tr ${gradeBg} text-white space-y-4 shadow-lg animate-fadeIn text-center">
      <span class="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-extrabold uppercase tracking-wider backdrop-blur-xs">
        ${t('test_results_title', l)}
      </span>

      <h1 class="text-3xl sm:text-5xl font-black tracking-tight">
        ${percent}%
      </h1>

      <div class="text-base sm:text-xl font-bold">
        ${gradeBadge}
      </div>

      <p class="text-xs sm:text-sm text-white/90 font-medium max-w-md mx-auto">
        ${total} ${t('test_score_summary', l)} <strong>${correctCount}</strong> ${t('test_score_correct', l)}.
      </p>

      <!-- Action Buttons -->
      <div class="flex items-center justify-center space-x-3 pt-2">
        <button id="results-new-test-btn" class="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-extrabold text-xs sm:text-sm shadow-md hover:scale-105 transition transform">
          ${t('new_test_btn', l)}
        </button>
        <button id="results-back-lessons-btn" class="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm transition">
          ${t('back_to_lessons', l)}
        </button>
      </div>
    </div>

    <!-- Question Analysis / Explanations List -->
    <div class="space-y-4 pt-4">
      <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
        ${t('review_mistakes_heading', l)}
      </h3>

      <div class="space-y-4">
        ${test.questions.map((q, idx) => {
          const userAns = test.answers[idx];
          const isCorrect = userAns === q.correctIndex;
          const isUnanswered = userAns === undefined;

          return `
            <div class="p-5 rounded-2xl border transition-all ${
              isCorrect 
                ? 'bg-emerald-50/30 dark:bg-slate-800/80 border-emerald-300 dark:border-emerald-800' 
                : 'bg-rose-50/30 dark:bg-slate-800/80 border-rose-300 dark:border-rose-800'
            }">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <span class="w-6 h-6 rounded-lg text-xs font-black text-white flex items-center justify-center ${
                    isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                  }">
                    ${idx + 1}
                  </span>
                  <span class="text-xs font-bold text-slate-600 dark:text-slate-300">${q.topicTitle}</span>
                </div>

                <span class="text-xs font-bold px-2 py-0.5 rounded-md ${
                  isCorrect 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }">
                  ${isCorrect ? '✅ To\'g\'ri' : isUnanswered ? '⚠️ Javobsiz' : '❌ Noto\'g\'ri'}
                </span>
              </div>

              <div class="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-3">
                ${q.question}
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold mb-3">
                <div class="p-2.5 rounded-xl ${
                  isCorrect 
                    ? 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200' 
                    : 'bg-rose-100/70 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200'
                }">
                  ${t('your_answer_label', l)} <strong>${userAns !== undefined ? q.options[userAns] : t('unanswered_label', l)}</strong>
                </div>

                ${!isCorrect ? `
                  <div class="p-2.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200">
                    ${t('correct_answer_label', l)} <strong>${q.options[q.correctIndex]}</strong>
                  </div>
                ` : ''}
              </div>

              <!-- Detailed Explanation -->
              <div class="p-3 rounded-xl bg-slate-100 dark:bg-slate-750 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                <strong>💡 Tushuntirish:</strong> ${q.explanation}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;

  container.innerHTML = html;

  document.getElementById("results-new-test-btn")?.addEventListener("click", openTestWizard);
  document.getElementById("results-back-lessons-btn")?.addEventListener("click", backToLessons);

  safeRenderMath(container);
  refreshLucide();
}

// ==========================================
// QIDIRUV, FILTRLAR VA TILLAR HODISALARI
// ==========================================
function initEventListeners() {
  // Test Generator Button in Header
  document.getElementById("nav-test-generator-btn")?.addEventListener("click", () => {
    if (AppState.currentView === "lesson") {
      openTestWizard();
    } else {
      backToLessons();
    }
  });

  // 1-Click Instant Language Switcher
  document.querySelectorAll(".lang-pill-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      if (lang) setLanguage(lang);
    });
  });

  // Qidiruv maydoni
  const searchInput = document.getElementById("search-input");
  const searchClearBtn = document.getElementById("search-clear-btn");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      AppState.searchQuery = e.target.value;
      if (searchClearBtn) {
        if (AppState.searchQuery.length > 0) {
          searchClearBtn.classList.remove("hidden");
        } else {
          searchClearBtn.classList.add("hidden");
        }
      }
      renderSidebarList();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener("click", () => {
      searchInput.value = "";
      AppState.searchQuery = "";
      searchClearBtn.classList.add("hidden");
      renderSidebarList();
      searchInput.focus();
    });
  }

  // Toifalar (Fanlar) tugmalari
  document.querySelectorAll(".category-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      AppState.activeCategory = btn.getAttribute("data-category");
      updateCategoryButtonsUI();

      const filtered = getFilteredTopics();
      if (filtered.length > 0 && !filtered.some(t => t.id === AppState.currentTopicId)) {
        selectTopic(filtered[0].id);
      } else {
        renderSidebarList();
      }
    });
  });

  // Tezkor sevimlilar tugmasi
  const quickFavBtn = document.getElementById("quick-fav-btn");
  if (quickFavBtn) {
    quickFavBtn.addEventListener("click", () => {
      if (AppState.activeCategory === "favorites") {
        AppState.activeCategory = "all";
        updateCategoryButtonsUI();
      } else {
        AppState.activeCategory = "favorites";
        document.querySelectorAll(".category-filter-btn").forEach(b => {
          b.className = "category-filter-btn flex-1 py-1.5 px-2 rounded-lg text-center transition text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white";
        });
      }
      renderSidebarList();
    });
  }

  // Mavzu (Dark/Light) almashtirish
  document.getElementById("theme-toggle-btn")?.addEventListener("click", toggleTheme);

  // Mobil menyu drawer
  const mobileToggle = document.getElementById("mobile-sidebar-toggle");
  const mobileClose = document.getElementById("mobile-sidebar-close");
  const backdrop = document.getElementById("sidebar-backdrop");

  mobileToggle?.addEventListener("click", openMobileSidebar);
  mobileClose?.addEventListener("click", closeMobileSidebar);
  backdrop?.addEventListener("click", closeMobileSidebar);

  // Mobil Bottom Navigation Bar tugmalari
  document.getElementById("mobile-nav-lessons")?.addEventListener("click", () => {
    openMobileSidebar();
  });

  document.getElementById("mobile-nav-test")?.addEventListener("click", () => {
    closeMobileSidebar();
    openTestWizard();
  });

  document.getElementById("mobile-nav-search")?.addEventListener("click", () => {
    openMobileSidebar();
    setTimeout(() => {
      searchInput?.focus();
    }, 200);
  });

  document.getElementById("mobile-nav-fav")?.addEventListener("click", () => {
    AppState.onlyFavorites = !AppState.onlyFavorites;
    renderSidebarList();
    openMobileSidebar();
  });

  document.getElementById("mobile-nav-theme")?.addEventListener("click", () => {
    toggleTheme();
  });

  // Klaviatura qisqa klavishi (Ctrl+K qidiruv)
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      searchInput?.focus();
    }
  });
}

function updateCategoryButtonsUI() {
  document.querySelectorAll(".category-filter-btn").forEach(btn => {
    const cat = btn.getAttribute("data-category");
    if (cat === AppState.activeCategory) {
      btn.className = "category-filter-btn flex-1 py-1.5 px-2 rounded-lg text-center transition bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-sm font-bold";
    } else {
      btn.className = "category-filter-btn flex-1 py-1.5 px-2 rounded-lg text-center transition text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white";
    }
  });
}

function openMobileSidebar() {
  const sidebar = document.getElementById("app-sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  sidebar?.classList.remove("-translate-x-full");
  backdrop?.classList.remove("hidden");
}

function closeMobileSidebar() {
  const sidebar = document.getElementById("app-sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  sidebar?.classList.add("-translate-x-full");
  backdrop?.classList.add("hidden");
}

function refreshLucide() {
  if (typeof lucide !== "undefined" && lucide && lucide.createIcons) {
    try {
      lucide.createIcons();
    } catch (e) {}
  }
}

function copyToClipboard(text, message = "Nusxalandi!") {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(message, "success");
    }).catch(() => {
      showToast("Nusxalab bo'lmadi", "error");
    });
  }
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast-animate px-4 py-2.5 rounded-xl shadow-lg text-xs sm:text-sm font-semibold flex items-center space-x-2 pointer-events-auto border ${
    type === "success" 
      ? 'bg-slate-900 text-white border-slate-700 dark:bg-white dark:text-slate-900' 
      : type === "info"
        ? 'bg-brand-600 text-white border-brand-500'
        : 'bg-red-600 text-white border-red-500'
  }`;

  toast.innerHTML = `
    <i data-lucide="${type === 'success' ? 'check' : type === 'info' ? 'info' : 'alert-triangle'}" class="w-4 h-4"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  refreshLucide();

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.25s ease";
    setTimeout(() => toast.remove(), 250);
  }, 2500);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
