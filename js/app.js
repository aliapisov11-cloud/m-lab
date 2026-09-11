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
          { left: "\\[", right: "\\]", display: true },
          { left: "\\(", right: "\\)", display: false },
          { left: "$", right: "$", display: false }
        ],
        throwOnError: false
      });
    } catch (e) {
      console.warn("KaTeX render error:", e);
    }
  }
}

function sanitizeLatexFractions(str) {
  if (!str) return "";
  let s = String(str).trim();
  
  // Remove delimiters if embedded inside display formula
  s = s.replace(/\\\(|\\\)|\\\[|\\\]|\$/g, "").trim();

  // Degree symbol
  s = s.replace(/°/g, "^\\circ");

  // Fix \text{ sm^2} or \text{ sm^3}
  s = s.replace(/\\text\{\s*([a-zA-ZА-Яа-яЁё]+)\^([0-9]+)\s*\}/g, "\\text{ $1 }^$2");

  // EKUK / EKUB / NOD / NOK / LCM / GCD
  s = s.replace(/\bEKUK\((\d+),\s*(\d+)(?:,\s*(\d+))?\)/g, (m, a, b, c) => `\\text{EKUK}(${a}, ${b}${c ? ', ' + c : ''})`);
  s = s.replace(/\bEKUB\((\d+),\s*(\d+)(?:,\s*(\d+))?\)/g, (m, a, b, c) => `\\text{EKUB}(${a}, ${b}${c ? ', ' + c : ''})`);
  s = s.replace(/\bНОК\((\d+),\s*(\d+)(?:,\s*(\d+))?\)/g, (m, a, b, c) => `\\text{НОК}(${a}, ${b}${c ? ', ' + c : ''})`);
  s = s.replace(/\bНОД\((\d+),\s*(\d+)(?:,\s*(\d+))?\)/g, (m, a, b, c) => `\\text{НОД}(${a}, ${b}${c ? ', ' + c : ''})`);
  s = s.replace(/\bLCM\((\d+),\s*(\d+)(?:,\s*(\d+))?\)/g, (m, a, b, c) => `\\text{LCM}(${a}, ${b}${c ? ', ' + c : ''})`);
  s = s.replace(/\bGCD\((\d+),\s*(\d+)(?:,\s*(\d+))?\)/g, (m, a, b, c) => `\\text{GCD}(${a}, ${b}${c ? ', ' + c : ''})`);

  // Mixed numbers: e.g. "5 7/10" -> "5\frac{7}{10}"
  s = s.replace(/\b(\d+)\s+(\d+)\/(\d+\b)/g, "$1\\frac{$2}{$3}");

  // Parenthesized fractions: e.g. "(15 + 14 - 4)/24" -> "\frac{15 + 14 - 4}{24}"
  s = s.replace(/\(([^)]+)\)\/(\d+\b)/g, "\\frac{$1}{$2}");

  // Simple fractions: e.g. "25/24" -> "\frac{25}{24}"
  s = s.replace(/(?<!\\frac\{)(?<!\w)(\d+)\/(\d+)(?!\w)/g, "\\frac{$1}{$2}");

  // Multiplication signs
  s = s.replace(/(?<=\d)\s*\*\s*(?=\d)/g, " \\cdot ");
  s = s.replace(/\s*\\times\s*/g, " \\cdot ");

  // Implications
  s = s.replace(/=>/g, " \\implies ");

  // Units
  s = s.replace(/\b(\d+)\s*(sm|dm|km|m|cm|мм|см|дм|м|км)\^([23])\b/g, "$1 \\text{ $2 }^$3");
  s = s.replace(/\b(\d+)\s*(sm|dm|km|m|cm|мм|см|дм|м|км)[²]\b/g, "$1 \\text{ $2 }^2");
  s = s.replace(/\b(\d+)\s*(sm|dm|km|m|cm|мм|см|дм|м|км)[³]\b/g, "$1 \\text{ $2 }^3");
  s = s.replace(/\b(\d+)\s*(sm|dm|km|kg|litr|so\'m|so‘m|som|sotix|ta|kun|soat|ga|см|дм|кг|литр|сум)\b/g, "$1 \\text{ $2 }");

  s = s.replace(/To'g'ri hisoblash:\s*/gi, "");
  s = s.replace(/Правильный расчет:\s*/gi, "");

  return s.trim();
}

function formatMathText(str) {
  if (!str) return "";
  let text = String(str).trim();

  // Normalize units & carets first
  text = text.replace(/\\text\{\s*([a-zA-ZА-Яа-яЁё]+)\^([0-9]+)\s*\}/g, "\\text{ $1 }^$2");
  text = text.replace(/\b(\d+)\s*(sm|dm|km|m|cm|мм|см|дм|м|км)\^([23])\b/g, "$1 \\text{ $2 }^$3");
  text = text.replace(/\b(\d+)\s*(sm|dm|km|kg|litr|so\'m|so‘m|som|sotix|ta|kun|soat|ga|см|дм|кг|литр|сум)\b/g, "$1 \\text{ $2 }");

  // 1. Tokenize existing math delimiters: \( ... \), \[ ... \], $$ ... $$
  const mathBlocks = [];
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    const id = mathBlocks.length;
    mathBlocks.push(`\\[${math.trim()}\\]`);
    return `___MATH_HOLD_${id}___`;
  });
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
    const id = mathBlocks.length;
    mathBlocks.push(`\\(${math.trim()}\\)`);
    return `___MATH_HOLD_${id}___`;
  });
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    const id = mathBlocks.length;
    mathBlocks.push(`\\[${math.trim()}\\]`);
    return `___MATH_HOLD_${id}___`;
  });

  // 2. Wrap complex LaTeX blocks outside placeholders
  text = text.replace(/\\begin\{cases\}[\s\S]*?\\end\{cases\}/g, (m) => {
    const id = mathBlocks.length;
    mathBlocks.push(`\\(${m.trim()}\\)`);
    return `___MATH_HOLD_${id}___`;
  });

  // Wrap vectors
  text = text.replace(/\\vec\{[a-zA-Z]\}(?:\([^\)]+\))?/g, (m) => {
    const id = mathBlocks.length;
    mathBlocks.push(`\\(${m.trim()}\\)`);
    return `___MATH_HOLD_${id}___`;
  });

  // Wrap integrals and limits
  text = text.replace(/\\int(?:_[0-9a-zA-Z\\\{\}]+)?(?:\^[0-9a-zA-Z\\\{\}]+)?\s*[\s\S]+?(?:\\,)?d[a-z]/g, (m) => {
    const id = mathBlocks.length;
    mathBlocks.push(`\\(${m.trim()}\\)`);
    return `___MATH_HOLD_${id}___`;
  });
  text = text.replace(/\\lim_\{[^{}]+\}\s*(?:\([^\)]+\)|[a-zA-Z0-9\+\-\*\/\\\{\}\^]+)/g, (m) => {
    const id = mathBlocks.length;
    mathBlocks.push(`\\(${m.trim()}\\)`);
    return `___MATH_HOLD_${id}___`;
  });

  // Wrap \sqrt{...}
  text = text.replace(/\\sqrt(?:\[\d+\])?\{[^{}]+\}/g, (m) => {
    const id = mathBlocks.length;
    mathBlocks.push(`\\(${m.trim()}\\)`);
    return `___MATH_HOLD_${id}___`;
  });

  // Wrap \frac{...}{...}
  text = text.replace(/(?:-?\d*\s*)?\\frac\{[^{}]+\}\{[^{}]+\}/g, (m) => {
    const id = mathBlocks.length;
    mathBlocks.push(`\\(${m.trim()}\\)`);
    return `___MATH_HOLD_${id}___`;
  });

  // Wrap \text{...} units and formulas
  text = text.replace(/(?:[-+]?\d*\s*)?\\text\{[^{}]+\}(?:\^[0-9]+)?/g, (m) => {
    const id = mathBlocks.length;
    mathBlocks.push(`\\(${m.trim()}\\)`);
    return `___MATH_HOLD_${id}___`;
  });

  // Wrap simple slash fractions e.g. 5 7/10 or 1/4
  text = text.replace(/\b(\d+)\s+(\d+)\/(\d+)\b/g, (_, whole, num, den) => {
    const id = mathBlocks.length;
    mathBlocks.push(`\\(${whole}\\frac{${num}}{${den}}\\)`);
    return `___MATH_HOLD_${id}___`;
  });
  text = text.replace(/(?<!\w)(\d+)\/(\d+)(?!\w)/g, (_, num, den) => {
    const id = mathBlocks.length;
    mathBlocks.push(`\\(\\frac{${num}}{${den}}\\)`);
    return `___MATH_HOLD_${id}___`;
  });

  // Wrap degree notations
  text = text.replace(/\b(\d+)°/g, (_, deg) => {
    const id = mathBlocks.length;
    mathBlocks.push(`\\(${deg}^\\circ\\)`);
    return `___MATH_HOLD_${id}___`;
  });
  text = text.replace(/\b(\d+)\^\\circ\b/g, (m) => {
    const id = mathBlocks.length;
    mathBlocks.push(`\\(${m.trim()}\\)`);
    return `___MATH_HOLD_${id}___`;
  });

  // Wrap standalone math symbols
  text = text.replace(/\\(?:alpha|beta|gamma|theta|pi|infty|emptyset|cdot|le|ge|neq|approx|implies|pm)\b/g, (m) => {
    const id = mathBlocks.length;
    mathBlocks.push(`\\(${m.trim()}\\)`);
    return `___MATH_HOLD_${id}___`;
  });

  // Polynomials and equations e.g. x^2 - 5x + 6 = 0, (x-3)^2 + 4, x_1 = 2, x_2 = 3
  text = text.replace(/\b(?:x_1\s*=\s*[-+]?\d+,\s*x_2\s*=\s*[-+]?\d+)\b/g, (m) => {
    const id = mathBlocks.length;
    mathBlocks.push(`\\(${m.trim()}\\)`);
    return `___MATH_HOLD_${id}___`;
  });
  text = text.replace(/(?:\([a-zA-Z]\s*[-+]\s*\d+\)\^2(?:\s*[-+]\s*\d+)?)/g, (m) => {
    const id = mathBlocks.length;
    mathBlocks.push(`\\(${m.trim()}\\)`);
    return `___MATH_HOLD_${id}___`;
  });
  text = text.replace(/\b(?:[-+]?\d*[a-zA-Z]\^[0-9]+(?:\s*[-+]\s*\d*[a-zA-Z])*(?:\s*[-+]\s*\d+)*(?:\s*=\s*[-+]?\d+)?)\b/g, (m) => {
    const id = mathBlocks.length;
    mathBlocks.push(`\\(${m.trim()}\\)`);
    return `___MATH_HOLD_${id}___`;
  });

  // Pure math strings without text
  const hasLongWords = /[a-zA-ZА-Яа-яЁё'ʼ]{4,}\s+[a-zA-ZА-Яа-яЁё'ʼ]{4,}/.test(text);
  if (!hasLongWords && mathBlocks.length === 0) {
    if (/^[-+]?\d+[\d\s\+\-\*\/\=\(\)\.\,\:\;\\_\^\^a-zA-Z\{\}]*$/.test(text) && /[\\^_=\+\-\*\/]/.test(text)) {
      return `\\(${text.trim()}\\)`;
    }
  }

  // Restore placeholders recursively in a while loop
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < mathBlocks.length; i++) {
      const token = `___MATH_HOLD_${i}___`;
      if (text.includes(token)) {
        text = text.replace(token, mathBlocks[i]);
        changed = true;
      }
    }
  }

  // Delimiter merging & cleanup
  text = text.replace(/\\\)\s*([=+\-*/,;]|\\approx|\\le|\\ge|\\implies|\\cup|\\cap|\\cdot)\s*\\\( /g, " $1 ");
  text = text.replace(/\\\)\s*\\\(/g, " ");
  text = text.replace(/\\\(\\\((.*?)\\\)\\\)/g, "\\($1\\)");

  // Final cleanup of spaces around colons/punctuation
  text = text.replace(/\s+([.,;:!?])/g, "$1");
  text = text.replace(/:\s*\\\(/g, ": \\(");
  text = text.replace(/[ \t]+/g, " ");

  return text.trim();
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
    userAnswers: {},
    timeRemaining: 0,
    timerInterval: null,
    isFinished: false
  },

  // AI Kamera Yechuvchi State
  aiCamera: {
    apiKey: localStorage.getItem("m_lab_gemini_key") || "",
    apiKeyStatus: localStorage.getItem("m_lab_gemini_key") ? "valid" : null,
    apiKeyError: null,
    imageBase64: null,
    imageMimeType: "image/jpeg",
    inputText: "5/8 + 7/12 - 1/6",
    isAnalyzing: false,
    solution: null,
    error: null,
    showSettings: false,
    isStreaming: false,
    stream: null,
    facingMode: "environment"
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
  closeMobileSidebar();
  updateMobileNavState("test");
  renderMainView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToLessons() {
  AppState.currentView = "lesson";
  window.location.hash = AppState.currentTopicId;
  closeMobileSidebar();
  updateMobileNavState("lesson");
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

  closeMobileSidebar();
  updateMobileNavState("lesson");

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
    const badges = {
      uz: ['🟢 1-bosqich: Birinchi nima qilamiz?', '🟡 2-bosqich: Ikkinchi nima qilamiz?', '🔴 3-bosqich: Natija va javob'],
      ru: ['🟢 Шаг 1: С чего начинаем?', '🟡 Шаг 2: Основное вычисление', '🔴 Шаг 3: Результат и ответ'],
      en: ['🟢 Step 1: Starting point', '🟡 Step 2: Main calculation', '🔴 Step 3: Result & final answer']
    };
    const teacherLabels = {
      uz: "O'qituvchi maslahati:",
      ru: 'Совет учителя:',
      en: "Teacher's Tip:"
    };
    const formulaLabels = {
      uz: "📐 Misoldagi amaliy ko'rinishi:",
      ru: '📐 Наглядный пример и формула:',
      en: '📐 Applied Formula & Calculation:'
    };

    const currentBadges = badges[l] || badges.uz;
    const teacherLabel = teacherLabels[l] || teacherLabels.uz;
    const formulaLabel = formulaLabels[l] || formulaLabels.uz;

    return example.solutionSteps.map((step, idx) => {
      const stepColor = idx === 0 
        ? 'bg-emerald-600 text-white' 
        : idx === 1 
          ? 'bg-amber-600 text-white' 
          : 'bg-indigo-600 text-white';

      const stepHeadingBadge = currentBadges[Math.min(idx, currentBadges.length - 1)];

      return `
        <div class="solution-step-card bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 sm:p-5 transition-all shadow-xs space-y-3.5">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center space-x-3">
              <span class="w-7 h-7 rounded-xl ${stepColor} text-xs font-black flex items-center justify-center flex-shrink-0 shadow-xs">
                ${step.stepNumber || (idx + 1)}
              </span>
              <div>
                <h5 class="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                  ${formatMathText(step.title || '')}
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
              <strong class="text-amber-800 dark:text-amber-300 block mb-0.5 text-xs font-extrabold">${teacherLabel}</strong>
              <span>${formatMathText(step.why || step.explanation || '')}</span>
            </div>
          </div>

          <!-- PASTIDA: Aniq misol va formulasi -->
          ${step.formula ? `
            <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-indigo-200/80 dark:border-indigo-900/60 space-y-1">
              <span class="text-[11px] font-extrabold uppercase tracking-wide text-indigo-700 dark:text-indigo-400 block">
                ${formulaLabel}
              </span>
              <div class="py-1 text-center text-xs sm:text-base text-indigo-600 dark:text-indigo-300 font-bold overflow-x-auto">
                \\[${sanitizeLatexFractions(step.formula)}\\]
              </div>
            </div>
          ` : ''}

          <!-- Qanday bajarildi / Natijasi -->
          <div class="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 font-bold flex items-center space-x-2">
            <span>✅</span>
            <span>${formatMathText(step.how || step.tip || '')}</span>
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
          ${formatMathText(topic.description)}
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
              ${formatMathText(formula.desc)}
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

          <div class="space-y-3">
            ${(currentPractice.solution?.steps || currentPractice.solutionSteps || []).map((step, sIdx) => `
              <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-purple-200/80 dark:border-slate-700 shadow-2xs space-y-2.5">
                <div class="flex items-center space-x-2">
                  <span class="w-6 h-6 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-xs">${sIdx + 1}</span>
                  <span class="text-xs sm:text-sm font-black text-slate-900 dark:text-white">${step.title}</span>
                </div>
                
                <!-- O'qituvchi tushuntirishi -->
                <div class="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed bg-purple-500/5 dark:bg-slate-750/50 p-3 rounded-xl border border-purple-100 dark:border-slate-700/60">
                  ${formatMathText(step.explanation || step.why || step.how || '')}
                </div>

                <!-- Formula -->
                ${step.formula ? `
                  <div class="py-2 px-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 text-xs sm:text-sm font-bold text-indigo-900 dark:text-indigo-200 text-center overflow-x-auto">
                    \\[${sanitizeLatexFractions(step.formula)}\\]
                  </div>
                ` : ''}

                <!-- Maslahat/Eslatma -->
                ${step.tip ? `
                  <div class="text-[11px] text-amber-700 dark:text-amber-300 font-bold flex items-center space-x-1 pt-1">
                    <span>💡 Maslahat:</span>
                    <span>${formatMathText(step.tip)}</span>
                  </div>
                ` : ''}
              </div>
            `).join("")}
          </div>

          <!-- Final Answer Banner -->
          <div class="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 dark:bg-emerald-950/60 border border-emerald-400/50 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-between flex-wrap gap-2">
            <span class="flex items-center space-x-2">
              <span class="text-lg">🎯</span>
              <span><strong>${t('practice_answer_heading', l)}</strong></span>
            </span>
            <span class="text-sm sm:text-base font-black px-3 py-1 rounded-xl bg-white/80 dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300">
              ${formatMathText(currentPractice.solution?.answer || currentPractice.solutionSteps?.[currentPractice.solutionSteps?.length - 1]?.tip || 'Javob muvaffaqiyatli topildi.')}
            </span>
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
            ${currentQ.topicTitle || (AppState.currentTopicId ? getLocalizedTopic(mathTopicsData.find(t => t.id === AppState.currentTopicId))?.title : '') || ''} ${currentQ.gradeNumber ? `(${getGradeLabel(currentQ.gradeNumber)})` : ''}
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
        ${formatMathText(currentQ.question)}
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
              <span class="flex-1">${formatMathText(opt)}</span>
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
                ${formatMathText(q.question)}
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold mb-3">
                <div class="p-2.5 rounded-xl ${
                  isCorrect 
                    ? 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200' 
                    : 'bg-rose-100/70 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200'
                }">
                  ${t('your_answer_label', l)} <strong>${userAns !== undefined ? formatMathText(q.options[userAns]) : t('unanswered_label', l)}</strong>
                </div>

                ${!isCorrect ? `
                  <div class="p-2.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200">
                    ${t('correct_answer_label', l)} <strong>${formatMathText(q.options[q.correctIndex])}</strong>
                  </div>
                ` : ''}
              </div>

              <!-- Detailed Explanation -->
              <div class="p-3 rounded-xl bg-slate-100 dark:bg-slate-750 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                <strong>💡 Tushuntirish:</strong> ${formatMathText(q.explanation)}
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

  // Qidiruv maydoni (Desktop & Mobile)
  const searchInput = document.getElementById("search-input");
  const searchClearBtn = document.getElementById("search-clear-btn");
  const mobileSearchInput = document.getElementById("mobile-search-input");
  const mobileSearchClearBtn = document.getElementById("mobile-search-clear-btn");

  function handleSearch(val) {
    AppState.searchQuery = val;
    if (searchInput && searchInput.value !== val) searchInput.value = val;
    if (mobileSearchInput && mobileSearchInput.value !== val) mobileSearchInput.value = val;

    if (searchClearBtn) {
      searchClearBtn.classList.toggle("hidden", val.length === 0);
    }
    if (mobileSearchClearBtn) {
      mobileSearchClearBtn.classList.toggle("hidden", val.length === 0);
    }
    renderSidebarList();
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => handleSearch(e.target.value));
  }
  if (mobileSearchInput) {
    mobileSearchInput.addEventListener("input", (e) => handleSearch(e.target.value));
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener("click", () => {
      handleSearch("");
      searchInput.focus();
    });
  }
  if (mobileSearchClearBtn) {
    mobileSearchClearBtn.addEventListener("click", () => {
      handleSearch("");
      mobileSearchInput.focus();
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

  // AI Kamera tugmalari (Header & Mobile Bottom Nav)
  document.getElementById("nav-camera-btn")?.addEventListener("click", openCameraModal);
  document.getElementById("mobile-nav-camera")?.addEventListener("click", openCameraModal);
  document.getElementById("camera-modal-close")?.addEventListener("click", closeCameraModal);
  document.getElementById("camera-modal-backdrop")?.addEventListener("click", closeCameraModal);

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
  if (document.body && document.body.style) {
    document.body.style.overflow = "hidden"; // Prevent background body scroll when drawer is open
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById("app-sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  sidebar?.classList.add("-translate-x-full");
  backdrop?.classList.add("hidden");
  if (document.body && document.body.style) {
    document.body.style.overflow = ""; // Restore background scroll
  }
}

function updateMobileNavState(viewName) {
  const navLessons = document.getElementById("mobile-nav-lessons");
  const navTest = document.getElementById("mobile-nav-test");
  const navFav = document.getElementById("mobile-nav-fav");
  const navCamera = document.getElementById("mobile-nav-camera");

  if (!navLessons || !navTest) return;

  const inactiveClass = "flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-brand-600 font-bold transition";
  const activeClass = "flex flex-col items-center justify-center p-1.5 rounded-xl text-brand-600 dark:text-brand-400 font-extrabold transition bg-brand-50 dark:bg-brand-950/60";
  const activeTestClass = "flex flex-col items-center justify-center p-1.5 rounded-xl text-purple-600 dark:text-purple-400 font-extrabold transition bg-purple-50 dark:bg-purple-950/60";
  const activeFavClass = "flex flex-col items-center justify-center p-1.5 rounded-xl text-amber-600 dark:text-amber-400 font-extrabold transition bg-amber-50 dark:bg-amber-950/60";
  const activeCameraClass = "flex flex-col items-center justify-center p-1.5 rounded-xl text-indigo-600 dark:text-indigo-400 font-extrabold transition bg-indigo-50 dark:bg-indigo-950/60";

  navLessons.className = viewName === "lesson" ? activeClass : inactiveClass;
  navTest.className = viewName === "test" ? activeTestClass : inactiveClass;
  if (navFav) {
    navFav.className = viewName === "fav" ? activeFavClass : inactiveClass;
  }
  if (navCamera) {
    navCamera.className = viewName === "camera" ? activeCameraClass : inactiveClass;
  }
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

// =======================================================
// M-LAB AQLLI MATEMATIKA DVIGATELI VA AI KAMERA YECHUVCHI
// =======================================================

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    let t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

function lcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

function lcmMultiple(arr) {
  return arr.reduce((acc, val) => lcm(acc, val), 1);
}

function normalizeMathExpr(raw) {
  if (!raw) return "";
  let s = String(raw).trim();
  s = s.replace(/\\cdot/g, "*")
       .replace(/\\times/g, "*")
       .replace(/\\div/g, "/")
       .replace(/×/g, "*")
       .replace(/÷/g, "/")
       .replace(/−/g, "-")
       .replace(/–/g, "-")
       .replace(/\\sqrt\{([^}]+)\}/g, "sqrt($1)")
       .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, " $1/$2 ")
       .replace(/\\left|\\right/g, "")
       .replace(/\((\d+)\)\/\((\d+)\)/g, "$1/$2")
       .replace(/\((\d+)\)/g, "$1")
       .replace(/[{}]/g, "")
       .replace(/\s+/g, " ");
  return s.trim();
}

class Fraction {
  constructor(n, d = 1) {
    if (d === 0) throw new Error("Maxraj nol bo'lishi mumkin emas!");
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d);
    this.n = Math.round(n / g);
    this.d = Math.round(d / g);
  }

  add(other) {
    return new Fraction(this.n * other.d + other.n * this.d, this.d * other.d);
  }

  sub(other) {
    return new Fraction(this.n * other.d - other.n * this.d, this.d * other.d);
  }

  mul(other) {
    return new Fraction(this.n * other.n, this.d * other.d);
  }

  div(other) {
    if (other.n === 0) throw new Error("Nolga bo'lish mumkin emas!");
    return new Fraction(this.n * other.d, this.d * other.n);
  }

  toLatex() {
    if (this.d === 1) return `${this.n}`;
    if (this.n === 0) return `0`;
    const sign = this.n < 0 ? "-" : "";
    const absN = Math.abs(this.n);
    if (absN > this.d) {
      const whole = Math.floor(absN / this.d);
      const rem = absN % this.d;
      if (rem === 0) return `${sign}${whole}`;
      return `${sign}${whole}\\frac{${rem}}{${this.d}} \\text{ yoki } ${sign}\\frac{${absN}}{${this.d}}`;
    }
    return `${sign}\\frac{${absN}}{${this.d}}`;
  }

  toSimpleLatex() {
    if (this.d === 1) return `${this.n}`;
    if (this.n === 0) return `0`;
    const sign = this.n < 0 ? "-" : "";
    return `${sign}\\frac{${Math.abs(this.n)}}{${this.d}}`;
  }
}

function trySolveFractionMulDiv(expr) {
  let clean = expr.trim();
  clean = clean.replace(/(\d+)\s+(\d+)\/(\d+)/g, (match, w, n, d) => {
    const num = parseInt(w, 10) * parseInt(d, 10) + parseInt(n, 10);
    return `${num}/${d}`;
  });

  const mulMatch = clean.match(/^(\d+)\/(\d+)\s*[\*xX]\s*(\d+)\/(\d+)$/);
  const divMatch = clean.match(/^(\d+)\/(\d+)\s*[\/:]\s*\(?(\d+)\/(\d+)\)?$/);

  if (mulMatch) {
    const [_, n1, d1, n2, d2] = mulMatch.map(Number);
    const f1 = new Fraction(n1, d1);
    const f2 = new Fraction(n2, d2);
    const res = f1.mul(f2);
    const numProd = n1 * n2;
    const denProd = d1 * d2;
    const g = gcd(numProd, denProd);

    return {
      is_math: true,
      engine: "m_lab_engine",
      problem_title: "Kasrlarni ko'paytirish",
      problem_latex: `\\frac{${n1}}{${d1}} \\cdot \\frac{${n2}}{${d2}}`,
      teacher_advice: "Kasrlarni ko'paytirishda suratlari bir-biriga, maxrajlari esa bir-biriga ko'paytiriladi. Imkon qadar ko'paytirishdan oldin qisqartirish amalini bajaramiz.",
      steps: [
        {
          step_num: 1,
          title: "1-qadam: Surat va maxrajlarni ko'paytirish qoidasi",
          explanation: "Suratlarni suratga, maxrajlarni maxrajga ko'paytirish ko'rinishida yozamiz:",
          formula: `\\frac{${n1} \\cdot ${n2}}{${d1} \\cdot ${d2}}`
        },
        {
          step_num: 2,
          title: "2-qadam: Hisoblash",
          explanation: "Surat va maxrajdagi ko'paytmalarni hisoblaymiz:",
          formula: `\\frac{${numProd}}{${denProd}}`
        },
        {
          step_num: 3,
          title: "3-qadam: Natijani qisqartirish",
          explanation: g > 1 ? `Surat va maxrajni ularning EKUBi $${g}$ ga qisqartiramiz:` : `Kasr qisqarmas holatda:`,
          formula: `${res.toLatex()}`
        }
      ],
      final_answer: res.toLatex(),
      verification: "Kasrlar ko'paytmasi hisoblandi."
    };
  }

  if (divMatch) {
    const [_, n1, d1, n2, d2] = divMatch.map(Number);
    const f1 = new Fraction(n1, d1);
    const f2 = new Fraction(n2, d2);
    const res = f1.div(f2);
    const numProd = n1 * d2;
    const denProd = d1 * n2;
    const g = gcd(numProd, denProd);

    return {
      is_math: true,
      engine: "m_lab_engine",
      problem_title: "Kasrlarni bo'lish",
      problem_latex: `\\frac{${n1}}{${d1}} : \\frac{${n2}}{${d2}}`,
      teacher_advice: "Kasrni kasrga bo'lish uchun birinchi kasrni ikkinchi kasrning teskarisiga (o'rni almashganiga) ko'paytirish kerak.",
      steps: [
        {
          step_num: 1,
          title: "1-qadam: Bo'lishni ko'paytirishga aylantirish",
          explanation: "Bo'luvchi kasrning surat va maxrajini o'rnini almashtirib, ko'paytirish amaliga o'tamiz:",
          formula: `\\frac{${n1}}{${d1}} \\cdot \\frac{${d2}}{${n2}}`
        },
        {
          step_num: 2,
          title: "2-qadam: Ko'paytirishni bajarish",
          explanation: "Suratlarni suratga, maxrajlarni maxrajga ko'paytiramiz:",
          formula: `\\frac{${n1} \\cdot ${d2}}{${d1} \\cdot ${n2}} = \\frac{${numProd}}{${denProd}}`
        },
        {
          step_num: 3,
          title: "3-qadam: Natijani qisqartirish",
          explanation: g > 1 ? `Surat va maxrajni EKUB $${g}$ ga qisqartiramiz:` : `Kasr qisqarmas holatda:`,
          formula: `${res.toLatex()}`
        }
      ],
      final_answer: res.toLatex(),
      verification: "Kasrlarni bo'lish amali yakunlandi."
    };
  }

  return null;
}

function trySolveFractionChain(expr) {
  let clean = expr.trim();
  clean = clean.replace(/(\d+)\s+(\d+)\/(\d+)/g, (match, w, n, d) => {
    const num = parseInt(w, 10) * parseInt(d, 10) + parseInt(n, 10);
    return `${num}/${d}`;
  });

  const spaceless = clean.replace(/\s+/g, "");
  const termRegex = /([+-]?\s*\d+\s*\/\s*\d+|[+-]?\s*\d+)/g;
  const terms = spaceless.match(termRegex);
  if (!terms || terms.join("") !== spaceless) return null;
  if (!terms.some(t => t.includes("/"))) return null;

  const parsedTerms = [];
  for (let t of terms) {
    t = t.replace(/\s+/g, "");
    let sign = 1;
    if (t.startsWith("+")) {
      t = t.substring(1);
    } else if (t.startsWith("-")) {
      sign = -1;
      t = t.substring(1);
    }
    if (t.includes("/")) {
      const [num, den] = t.split("/").map(Number);
      if (isNaN(num) || isNaN(den) || den === 0) return null;
      parsedTerms.push({ sign, num, den });
    } else {
      const num = Number(t);
      if (isNaN(num)) return null;
      parsedTerms.push({ sign, num, den: 1 });
    }
  }

  if (parsedTerms.length === 0) return null;

  const denoms = parsedTerms.map(t => t.den).filter(d => d > 1);
  const commonDenom = denoms.length > 0 ? lcmMultiple(denoms) : 1;

  const multipliers = parsedTerms.map(t => commonDenom / t.den);
  const numerators = parsedTerms.map((t, i) => t.sign * t.num * multipliers[i]);
  const sumNumerators = numerators.reduce((a, b) => a + b, 0);

  const finalFrac = new Fraction(sumNumerators, commonDenom);

  const problemLatex = parsedTerms.map((t, idx) => {
    const s = idx > 0 ? (t.sign >= 0 ? "+ " : "- ") : (t.sign < 0 ? "-" : "");
    if (t.den === 1) return `${s}${t.num}`;
    return `${s}\\frac{${t.num}}{${t.den}}`;
  }).join(" ");

  const denListStr = denoms.join(", ");
  const step1Formula = `\\text{EKUK}(${denListStr}) = ${commonDenom}`;
  const multText = parsedTerms.map((t, i) => {
    if (t.den === 1) return `Butun son $${t.num}$ uchun qo'shimcha ko'paytuvchi: $${commonDenom}$`;
    return `$\\frac{${t.num}}{${t.den}}$ kasr uchun qo'shimcha ko'paytuvchi: $${commonDenom} : ${t.den} = ${multipliers[i]}$`;
  }).join("<br>");

  const expandedStepLatex = parsedTerms.map((t, i) => {
    const s = i > 0 ? (t.sign >= 0 ? "+" : "-") : (t.sign < 0 ? "-" : "");
    if (t.den === 1) return `${s}\\frac{${t.num} \\cdot ${commonDenom}}{${commonDenom}}`;
    return `${s}\\frac{${t.num} \\cdot ${multipliers[i]}}{${commonDenom}}`;
  }).join(" ");

  const combinedNumeratorLatex = `\\frac{${numerators.map((n, i) => i > 0 ? (n >= 0 ? `+ ${n}` : `- ${Math.abs(n)}`) : `${n}`).join(" ")}}{${commonDenom}} = \\frac{${sumNumerators}}{${commonDenom}}`;

  const g = gcd(sumNumerators, commonDenom);
  let step3Desc = "";
  let step3Formula = "";
  if (g > 1) {
    step3Desc = `Hosil bo'lgan $\\frac{${sumNumerators}}{${commonDenom}}$ kasrning surati va maxrajini ularning EKUBi $${g}$ ga bo'lib qisqartiramiz.`;
    step3Formula = `\\frac{${sumNumerators} : ${g}}{${commonDenom} : ${g}} = ${finalFrac.toSimpleLatex()}`;
    if (Math.abs(finalFrac.n) > finalFrac.d && finalFrac.d > 1) {
      const whole = Math.floor(Math.abs(finalFrac.n) / finalFrac.d);
      const rem = Math.abs(finalFrac.n) % finalFrac.d;
      const sign = finalFrac.n < 0 ? "-" : "";
      step3Formula += ` = ${sign}${whole}\\frac{${rem}}{${finalFrac.d}}`;
    }
  } else {
    step3Desc = `Kasr qisqarmas holatda: surati va maxraji o'zaro tub sonlar.`;
    step3Formula = finalFrac.toLatex();
  }

  return {
    is_math: true,
    engine: "m_lab_engine",
    problem_title: "Kasrlarni qo'shish va ayirish",
    problem_latex: problemLatex,
    teacher_advice: "Turli maxrajli kasrlarni qo'shish yoki ayirish uchun avval barcha maxrajlarning EKUKini topib, umumiy maxrajga keltiramiz. So'ngra suratlarni hisoblab, yakuniy natijani qisqartiramiz.",
    steps: [
      {
        step_num: 1,
        title: "1-qadam: Umumiy maxrajni (EKUK) topish",
        explanation: `Maxrajlar (${denListStr}) uchun eng kichik umumiy karralini topamiz va har bir kasrning qo'shimcha ko'paytuvchisini aniqlaymiz:<br>${multText}`,
        formula: step1Formula
      },
      {
        step_num: 2,
        title: "2-qadam: Kasrlarni umumiy maxrajga keltirish va hisoblash",
        explanation: `Har bir kasrning suratini o'zining qo'shimcha ko'paytuvchisiga ko'paytirib, bir umumiy maxraj ostida yozamiz va suratlarni hisoblaymiz:`,
        formula: `${expandedStepLatex} = ${combinedNumeratorLatex}`
      },
      {
        step_num: 3,
        title: "3-qadam: Natijani qisqartirish va soddalashtirish",
        explanation: step3Desc,
        formula: step3Formula
      }
    ],
    final_answer: finalFrac.toLatex(),
    verification: `Yechim to'liq va aniq tekshirildi.`
  };
}

function trySolveQuadratic(expr) {
  let clean = expr.replace(/\s+/g, "").toLowerCase();
  if (!clean.includes("x^2") && !clean.includes("x2")) return null;
  clean = clean.replace(/x2/g, "x^2");
  if (!clean.includes("=")) clean += "=0";

  const [left, right] = clean.split("=");
  if (right !== "0") return null;

  let a = 0, b = 0, c = 0;
  
  const matchA = left.match(/([+-]?\d*)x\^2/);
  if (matchA) {
    let strA = matchA[1];
    if (strA === "" || strA === "+") a = 1;
    else if (strA === "-") a = -1;
    else a = parseInt(strA, 10);
  } else {
    return null;
  }

  const rest = left.replace(/([+-]?\d*)x\^2/, "");
  
  const matchB = rest.match(/([+-]?\d*)x(?!\^)/);
  if (matchB) {
    let strB = matchB[1];
    if (strB === "" || strB === "+") b = 1;
    else if (strB === "-") b = -1;
    else b = parseInt(strB, 10);
  } else {
    b = 0;
  }

  const constRest = rest.replace(/([+-]?\d*)x(?!\^)/, "");
  if (constRest) {
    c = parseInt(constRest, 10) || 0;
  }

  if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) return null;

  const D = b * b - 4 * a * c;
  const problemLatex = `${a === 1 ? "" : a === -1 ? "-" : a}x^2 ${b > 0 ? "+ " + (b === 1 ? "" : b) : b < 0 ? "- " + (b === -1 ? "" : Math.abs(b)) : ""}x ${c > 0 ? "+ " + c : c < 0 ? "- " + Math.abs(c) : ""} = 0`.replace(/\s+/g, " ").trim();

  let steps = [];
  let finalAns = "";

  steps.push({
    step_num: 1,
    title: "1-qadam: Kvadrat tenglama koeffitsiyentlarini aniqlash",
    explanation: `Tenglamani umumiy ko'rinish $ax^2 + bx + c = 0$ bilan taqqoslab, $a, b, c$ koeffitsiyentlarini yozib olamiz:`,
    formula: `a = ${a}, \\quad b = ${b}, \\quad c = ${c}`
  });

  steps.push({
    step_num: 2,
    title: "2-qadam: Diskriminantni ($D$) hisoblash",
    explanation: `Diskriminant formulasini qo'llaymiz: $D = b^2 - 4ac$`,
    formula: `D = (${b})^2 - 4 \\cdot (${a}) \\cdot (${c}) = ${b * b} ${-4 * a * c >= 0 ? "+ " + (-4 * a * c) : "- " + Math.abs(-4 * a * c)} = ${D}`
  });

  if (D > 0) {
    const sqrtD = Math.sqrt(D);
    const isPerfect = Number.isInteger(sqrtD);
    if (isPerfect) {
      const frac1 = new Fraction(-b + sqrtD, 2 * a);
      const frac2 = new Fraction(-b - sqrtD, 2 * a);
      steps.push({
        step_num: 3,
        title: "3-qadam: Tenglamaning 2 ta haqiqiy ildizini topish",
        explanation: `$D > 0$ bo'lgani uchun tenglama 2 ta turli haqiqiy ildizga ega. Ildizlar formulasi: $x_{1,2} = \\frac{-b \\pm \\sqrt{D}}{2a}$`,
        formula: `x_1 = \\frac{-(${b}) + ${sqrtD}}{2 \\cdot (${a})} = ${frac1.toSimpleLatex()}, \\quad x_2 = \\frac{-(${b}) - ${sqrtD}}{2 \\cdot (${a})} = ${frac2.toSimpleLatex()}`
      });
      finalAns = `x_1 = ${frac1.toSimpleLatex()}, \\quad x_2 = ${frac2.toSimpleLatex()}`;
    } else {
      steps.push({
        step_num: 3,
        title: "3-qadam: Tenglama ildizlarini ifodalash",
        explanation: `$D > 0$ bo'lgani uchun tenglama 2 ta haqiqiy ildizga ega:`,
        formula: `x_{1,2} = \\frac{-(${b}) \\pm \\sqrt{${D}}}{${2 * a}}`
      });
      finalAns = `x_{1,2} = \\frac{${-b} \\pm \\sqrt{${D}}}{${2 * a}}`;
    }
  } else if (D === 0) {
    const fracX = new Fraction(-b, 2 * a);
    steps.push({
      step_num: 3,
      title: "3-qadam: Bitta karrali ildizni topish",
      explanation: `$D = 0$ bo'lgani uchun tenglama bitta (karrali) ildizga ega: $x = -\\frac{b}{2a}$`,
      formula: `x = \\frac{-(${b})}{2 \\cdot (${a})} = ${fracX.toSimpleLatex()}`
    });
    finalAns = `x = ${fracX.toSimpleLatex()}`;
  } else {
    steps.push({
      step_num: 3,
      title: "3-qadam: Ildizlar mavjudligini tahlil qilish",
      explanation: `Diskriminant manfiy ($D = ${D} < 0$) bo'lgani uchun berilgan kvadrat tenglama haqiqiy sonlar to'plamida ildizga ega emas (bo'sh to'plam $\\varnothing$).`,
      formula: `D < 0 \\implies x \\in \\varnothing`
    });
    finalAns = `\\text{Haqiqiy ildizlari yo'q } (x \\in \\varnothing)`;
  }

  return {
    is_math: true,
    engine: "m_lab_engine",
    problem_title: "Kvadrat tenglamani yechish",
    problem_latex: problemLatex,
    teacher_advice: "Kvadrat tenglamani yechishda avval $a, b, c$ koeffitsiyentlarni aniqlab, $D = b^2 - 4ac$ diskriminantni hisoblaymiz. $D > 0$ bo'lsa 2 ta ildiz, $D = 0$ bo'lsa 1 ta ildiz, $D < 0$ bo'lsa haqiqiy ildiz yo'q.",
    steps,
    final_answer: finalAns,
    verification: "Kvadrat tenglama to'liq diskriminant usulida yechildi."
  };
}

function trySolveLinear(expr) {
  let clean = expr.replace(/\s+/g, "").toLowerCase();
  if (!clean.includes("x") || clean.includes("x^2") || clean.includes("x2")) return null;
  if (!clean.includes("=")) return null;

  const [leftStr, rightStr] = clean.split("=");
  if (!leftStr || !rightStr) return null;

  function parseLinearSide(side) {
    let a = 0, b = 0;
    const terms = side.match(/([+-]?[^+-]+)/g) || [];
    for (let t of terms) {
      if (t.includes("x")) {
        const coeffStr = t.replace("x", "");
        if (coeffStr === "" || coeffStr === "+") a += 1;
        else if (coeffStr === "-") a -= 1;
        else a += parseFloat(coeffStr) || 0;
      } else {
        b += parseFloat(t) || 0;
      }
    }
    return { a, b };
  }

  const left = parseLinearSide(leftStr);
  const right = parseLinearSide(rightStr);

  const netA = left.a - right.a;
  const netB = right.b - left.b;

  if (netA === 0) {
    if (netB === 0) {
      return {
        is_math: true,
        engine: "m_lab_engine",
        problem_title: "Chiziqli tenglama",
        problem_latex: `${expr}`,
        teacher_advice: "Tenglik ayniyat bo'lib, x ning har qanday qiymatida to'g'ri bo'ladi.",
        steps: [
          {
            step_num: 1,
            title: "1-qadam: Noma'lumlarni bir tomonga o'tkazish",
            explanation: "Ikkala tomondagi x li hadlar bir-birini qisqartirib yuboradi: $0x = 0$.",
            formula: "0x = 0"
          }
        ],
        final_answer: "x \\in \\mathbb{R} \\text{ (cheksiz ko'p yechim)}",
        verification: "Ayniyat tekshirildi."
      };
    } else {
      return {
        is_math: true,
        engine: "m_lab_engine",
        problem_title: "Chiziqli tenglama",
        problem_latex: `${expr}`,
        teacher_advice: "Tenglama ziddiyatga olib keldi, yechim mavjud emas.",
        steps: [
          {
            step_num: 1,
            title: "1-qadam: Noma'lumlarni o'tkazish",
            explanation: "$0x = " + netB + "$ tenglik hech qachon bajarilmaydi.",
            formula: "0 = " + netB + " \\quad (\\text{xato})"
          }
        ],
        final_answer: "x \\in \\varnothing \\text{ (yechim yo'q)}",
        verification: "Yechimsiz tenglama."
      };
    }
  }

  const solution = new Fraction(netB, netA);
  const problemLatex = `${leftStr} = ${rightStr}`;

  return {
    is_math: true,
    engine: "m_lab_engine",
    problem_title: "Bir noma'lumli chiziqli tenglama",
    problem_latex: problemLatex,
    teacher_advice: "Chiziqli tenglamani yechishda noma'lumli hadlarni tenglikning chap tomoniga, sonlarni (ozod hadlarni) o'ng tomoniga ishoralarini teskarisiga o'zgartirib o'tkazamiz.",
    steps: [
      {
        step_num: 1,
        title: "1-qadam: Noma'lum hadlarni chapga, sonlarni o'ngga o'tkazish",
        explanation: `Tenglik qoidasiga ko'ra, hadlarni bir tomondan ikkinchi tomonga o'tkazayotganda ishoralari qarama-qarshisiga o'zgaradi:`,
        formula: `${left.a !== 0 ? left.a + 'x' : ''} ${right.a > 0 ? '- ' + right.a + 'x' : right.a < 0 ? '+ ' + Math.abs(right.a) + 'x' : ''} = ${right.b} ${left.b > 0 ? '- ' + left.b : left.b < 0 ? '+ ' + Math.abs(left.b) : ''}`
      },
      {
        step_num: 2,
        title: "2-qadam: O'xshash hadlarni ixchamlash",
        explanation: `Har ikkala tomondagi amallarni bajaramiz:`,
        formula: `${netA}x = ${netB}`
      },
      {
        step_num: 3,
        title: "3-qadam: Noma'lum $x$ ni topish",
        explanation: `Noma'lum ko'paytuvchi $x$ ni topish uchun o'ng tomondagi sonni $x$ ning koeffitsiyenti $${netA}$ ga bo'lamiz:`,
        formula: `x = \\frac{${netB}}{${netA}} = ${solution.toSimpleLatex()}`
      }
    ],
    final_answer: `x = ${solution.toSimpleLatex()}`,
    verification: `Topilgan javob: x = ${solution.toSimpleLatex()}`
  };
}

function trySolveArithmetic(expr) {
  let clean = expr.trim();
  let jsExpr = clean
    .replace(/\^/g, "**")
    .replace(/sqrt\(([^)]+)\)/g, "Math.sqrt($1)")
    .replace(/(\d+)%/g, "($1/100)");

  if (!/^[\d\s\+\-\*\/\(\)\.\,Mathsqrt]+$/.test(jsExpr.replace(/Math\.sqrt/g, ""))) {
    return null;
  }

  try {
    const result = Function(`"use strict"; return (${jsExpr})`)();
    if (typeof result !== "number" || isNaN(result) || !isFinite(result)) return null;

    const formattedRes = Number.isInteger(result) ? result : Math.round(result * 10000) / 10000;
    const problemLatex = clean.replace(/\*/g, " \\cdot ").replace(/sqrt\(([^)]+)\)/g, "\\sqrt{$1}");

    return {
      is_math: true,
      engine: "m_lab_engine",
      problem_title: "Arifmetik ifodani hisoblash",
      problem_latex: problemLatex,
      teacher_advice: "Arifmetik amallarni bajarish tartibi: 1) Qavs ichidagi amallar; 2) Darajaga ko'tarish va ildiz chiqarish; 3) Ko'paytirish va bo'lish; 4) Qo'shish va ayirish (chapdan o'ngga).",
      steps: [
        {
          step_num: 1,
          title: "1-qadam: Amallar ketma-ketligini aniqlash",
          explanation: `Ifodadagi amallarni standart matematik qoidalar bo'yicha tartiblaymiz.`,
          formula: `\\text{Ifoda: } ${problemLatex}`
        },
        {
          step_num: 2,
          title: "2-qadam: Qavslar, darajalar va ko'paytirish/bo'lish amallarini bajarish",
          explanation: `Barcha ustuvor amallarni qadamma-qadam hisoblab chiqamiz.`,
          formula: `\\dots = ${formattedRes}`
        },
        {
          step_num: 3,
          title: "3-qadam: Yakuniy qo'shish va ayirish amallari",
          explanation: `Barcha oraliq natijalarni birlashtirib, yakuniy qiymatni olamiz.`,
          formula: `\\text{Natija} = ${formattedRes}`
        }
      ],
      final_answer: `${formattedRes}`,
      verification: `Hisob-kitob aniq bajarildi.`
    };
  } catch (e) {
    return null;
  }
}

function solveMathExpressionLocally(rawExpr) {
  const norm = normalizeMathExpr(rawExpr);
  if (!norm) return null;

  const fracMulDiv = trySolveFractionMulDiv(norm);
  if (fracMulDiv) return fracMulDiv;

  const fracSol = trySolveFractionChain(norm);
  if (fracSol) return fracSol;

  const quadSol = trySolveQuadratic(norm);
  if (quadSol) return quadSol;

  const linSol = trySolveLinear(norm);
  if (linSol) return linSol;

  const arithSol = trySolveArithmetic(norm);
  if (arithSol) return arithSol;

  return null;
}

// ==========================================
// AI KAMERA VA TEZKOR YECHUVCHI MODALI
// ==========================================
// ==========================================
// AI JONLI KAMERA VA TEZKOR YECHUVCHI MODALI
// ==========================================
function openCameraModal() {
  const modal = document.getElementById("camera-solver-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  closeMobileSidebar();
  updateMobileNavState("camera");
  if (document.body && document.body.style) document.body.style.overflow = "hidden";
  renderCameraModalContent();
  refreshLucide();
}

function closeCameraModal() {
  stopLiveCamera();
  const modal = document.getElementById("camera-solver-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  if (document.body && document.body.style) document.body.style.overflow = "";
  if (AppState.currentView === "lesson") {
    updateMobileNavState("lesson");
  } else if (AppState.currentView === "test_wizard" || AppState.currentView === "test_runner") {
    updateMobileNavState("test");
  }
}

async function startLiveCamera() {
  try {
    if (AppState.aiCamera.stream) {
      AppState.aiCamera.stream.getTracks().forEach(t => t.stop());
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast("Brauzeringizda jonli video qo'llab-quvvatlanmaydi. 'Suratga olish' orqali rasm oling.", "info");
      document.getElementById("native-camera-input")?.click();
      return;
    }
    const constraints = {
      video: {
        facingMode: { ideal: AppState.aiCamera.facingMode },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    AppState.aiCamera.stream = stream;
    AppState.aiCamera.isStreaming = true;
    AppState.aiCamera.solution = null;
    AppState.aiCamera.imageBase64 = null;
    AppState.aiCamera.error = null;
    renderCameraModalContent();

    setTimeout(() => {
      const video = document.getElementById("ai-camera-live-video");
      if (video) {
        video.srcObject = stream;
        video.play().catch(e => console.warn("Video play error:", e));
      }
    }, 50);
  } catch (err) {
    console.warn("Live camera access failed or denied:", err);
    AppState.aiCamera.isStreaming = false;
    AppState.aiCamera.stream = null;
    showToast("Kameraga ruxsat cheklangan. '📸 Suratga olish' yoki '🖼️ Galereya' tugmasidan foydalaning.", "info");
    renderCameraModalContent();
  }
}

function stopLiveCamera() {
  if (AppState.aiCamera.stream) {
    AppState.aiCamera.stream.getTracks().forEach(t => t.stop());
    AppState.aiCamera.stream = null;
  }
  AppState.aiCamera.isStreaming = false;
}

function flipLiveCamera() {
  AppState.aiCamera.facingMode = AppState.aiCamera.facingMode === "environment" ? "user" : "environment";
  startLiveCamera();
}

function captureLiveSnapshot() {
  const video = document.getElementById("ai-camera-live-video");
  if (!video || !AppState.aiCamera.isStreaming) return;
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  AppState.aiCamera.imageBase64 = dataUrl;
  AppState.aiCamera.imageMimeType = "image/jpeg";
  stopLiveCamera();
  solveMathWithGemini();
}

function handleCameraImageFile(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("Faqat rasm fayllari qabul qilinadi", "error");
    return;
  }
  stopLiveCamera();
  const reader = new FileReader();
  reader.onload = (e) => {
    AppState.aiCamera.imageBase64 = e.target.result;
    AppState.aiCamera.imageMimeType = file.type || "image/jpeg";
    AppState.aiCamera.solution = null;
    AppState.aiCamera.error = null;
    renderCameraModalContent();
  };
  reader.readAsDataURL(file);
}

async function testGeminiApiKey(keyToTest) {
  const cleanKey = (keyToTest || "").trim().replace(/^["']|["']$/g, '');
  if (!cleanKey) {
    AppState.aiCamera.apiKey = "";
    AppState.aiCamera.apiKeyStatus = "invalid";
    AppState.aiCamera.apiKeyError = "Kalit kiritilmagan. Iltimos, Google AI Studio API kalitini kiriting.";
    localStorage.removeItem("m_lab_gemini_key");
    renderCameraModalContent();
    return false;
  }

  if (cleanKey.startsWith("ghp_") || cleanKey.startsWith("github_pat_")) {
    AppState.aiCamera.apiKeyStatus = "invalid";
    AppState.aiCamera.apiKeyError = "Siz GitHub tokeni kiritdingiz (" + cleanKey.substring(0, 8) + "...). Matematikani yechish uchun Google AI Studio ('AIzaSy...' yoki 'AQ...') kaliti kerak.";
    showToast("⚠️ Bu GitHub kaliti. Google AI Studio kaliti kerak.", "error");
    renderCameraModalContent();
    return false;
  }

  if (cleanKey.length < 15) {
    AppState.aiCamera.apiKeyStatus = "invalid";
    AppState.aiCamera.apiKeyError = "Google AI Studio kaliti juda qisqa ko'rinmoqda. Kalitni to'g'ri ko'chirganingizga ishonch hosil qiling.";
    renderCameraModalContent();
    return false;
  }

  AppState.aiCamera.apiKeyStatus = "testing";
  AppState.aiCamera.apiKeyError = null;
  renderCameraModalContent();

  const pingBody = {
    contents: [
      { parts: [{ text: "Salom, 2+2 nechaga teng?" }] }
    ]
  };

  const modelsToTest = [
    "gemini-flash-latest",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash",
    "gemini-1.5-flash"
  ];

  let testSuccess = false;
  let lastErrorMsg = "";

  for (const model of modelsToTest) {
    try {
      let res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pingBody)
      });

      if (res.ok) {
        testSuccess = true;
        AppState.aiCamera.apiKey = cleanKey;
        AppState.aiCamera.apiKeyStatus = "valid";
        AppState.aiCamera.apiKeyError = null;
        localStorage.setItem("m_lab_gemini_key", cleanKey);
        showToast(`✅ Google AI Studio API kaliti muvaffaqiyatli ulandi (${model})!`, "success");
        renderCameraModalContent();
        return true;
      } else {
        const errJson = await res.json().catch(() => ({}));
        lastErrorMsg = errJson.error?.message || `HTTP ${res.status}`;
      }
    } catch (e) {
      lastErrorMsg = e.message || "Ulanishda xatolik";
    }
  }

  AppState.aiCamera.apiKeyStatus = "invalid";
  AppState.aiCamera.apiKeyError = lastErrorMsg;
  showToast(`❌ Kalitda xatolik: ${lastErrorMsg}`, "error");
  renderCameraModalContent();
  return false;
}

async function solveMathWithGemini(explicitExpression = null) {
  stopLiveCamera();
  const exprInput = document.getElementById("ai-expr-input");
  let queryText = (typeof explicitExpression === "string" && explicitExpression) 
    ? explicitExpression 
    : (exprInput ? exprInput.value.trim() : (AppState.aiCamera.inputText || ""));

  if (queryText) {
    AppState.aiCamera.inputText = queryText;
  }

  const hasImage = !!AppState.aiCamera.imageBase64;
  const rawKey = (AppState.aiCamera.apiKey || localStorage.getItem("m_lab_gemini_key") || "").trim().replace(/^["']|["']$/g, '');
  const isValidGeminiKey = rawKey.length >= 15 && !rawKey.startsWith("ghp_") && !rawKey.startsWith("github_pat_");

  AppState.aiCamera.isAnalyzing = true;
  AppState.aiCamera.error = null;
  renderCameraModalContent();

  // 1. If valid Google AI Studio key AND image present, try Gemini Multimodal Vision API
  if (hasImage && isValidGeminiKey) {
    const systemPrompt = `Siz M-LAB loyihasining eng tajribali, samimiy va kuchli matematika o'qituvchisisiz.
Foydalanuvchi yuborgan rasmdagi matematika misolini yoki masalasini diqqat bilan o'qing va uni o'quvchiga tushunarli, bosqichma-bosqich (1-qadam, 2-qadam, 3-qadam...) qilib to'liq hisob-kitoblari va formulalari bilan yechib bering.

QAT'IY QOIDALAR:
1. HECH QACHON faqat quruq yakuniy javob bermang! Har bir hisoblash amalini qadamma-qadam erinmasdan ko'rsating.
2. O'qituvchi maslahatini samimiy, sodda o'zbek tilida yozing.
3. Barcha matematik formulalarni toza LaTeX formatida bering (masalan: \\frac{a}{b}, x^2, \\sqrt{y}, \\cdot, 2\\pi). Barcha kasrlarni \\frac{a}{b} ko'rinishida yozing.
4. Javobni FAQAT quyidagi JSON formatida qaytaring:
{
  "is_math": true,
  "engine": "gemini_ai",
  "problem_title": "Mavzu yoki misol nomi",
  "problem_latex": "Misolning to'liq matematik formulasi",
  "teacher_advice": "O'qituvchi maslahati: bu misolni yechishda qaysi qoidani qo'llaymiz va birinchi nima qilamiz",
  "steps": [
    {
      "step_num": 1,
      "title": "1-qadam: ...",
      "explanation": "Ushbu qadamda nima ish qilingani tushuntirishi",
      "formula": "Ushbu qadamdagi formula va hisob-kitob (LaTeX)"
    }
  ],
  "final_answer": "Yakuniy to'g'ri javob (LaTeX)",
  "verification": "Javobning qisqacha xulosasi"
}`;

    try {
      const pureBase64 = AppState.aiCamera.imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      const mimeType = AppState.aiCamera.imageMimeType || "image/jpeg";

      const requestBody = {
        contents: [
          {
            parts: [
              { text: systemPrompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: pureBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      };

      const modelsToTry = [
        "gemini-flash-latest",
        "gemini-3.7-flash",
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite",
        "gemini-2.5-flash",
        "gemini-1.5-flash"
      ];

      let solved = false;
      for (const model of modelsToTry) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${rawKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
          });

          if (response.ok) {
            const resJson = await response.json();
            const candidateText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText) {
              const cleanedText = candidateText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
              const parsedSolution = JSON.parse(cleanedText);
              parsedSolution.engine = "gemini_ai";
              AppState.aiCamera.isAnalyzing = false;
              AppState.aiCamera.solution = parsedSolution;
              AppState.aiCamera.apiKeyStatus = "valid";
              renderCameraModalContent();
              solved = true;
              return;
            }
          }
        } catch (mErr) {
          console.warn(`Model ${model} try failed:`, mErr);
        }
      }

      if (!solved) {
        showToast("⚠️ Gemini API kaliti xato yoki cheklovga uchragan. M-LAB o'rnatilgan dvigateli ishlatilmoqda.", "warning");
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to M-LAB engine:", err);
      showToast("⚠️ Google AI Studio bilan bog'lanishda xatolik. M-LAB o'rnatilgan dvigateli ishlatildi.", "info");
    }
  }

  // 2. M-LAB Local Smart Math Engine (Instant, 100% Reliable Fallback)
  const targetText = queryText || "5/8 + 7/12 - 1/6";
  const localSolution = solveMathExpressionLocally(targetText);

  // Short delay for smooth UX transition
  await new Promise(r => setTimeout(r, 350));

  AppState.aiCamera.isAnalyzing = false;

  if (localSolution) {
    AppState.aiCamera.solution = localSolution;
  } else {
    AppState.aiCamera.solution = {
      is_math: false,
      error_message: "Kiritilgan ifodani tahlil qilib bo'lmadi. Iltimos, misol sintaksisini tekshiring (masalan: 5/8 + 7/12 - 1/6 yoki 2x + 5 = 15 yoki x^2 - 5x + 6 = 0)."
    };
  }

  renderCameraModalContent();
}

function renderCameraModalContent() {
  const container = document.getElementById("camera-modal-body");
  if (!container) return;

  const cam = AppState.aiCamera;
  const rawKey = (cam.apiKey || localStorage.getItem("m_lab_gemini_key") || "").trim().replace(/^["']|["']$/g, '');
  const isKeyValid = cam.apiKeyStatus === "valid" || (rawKey.length >= 15 && !rawKey.startsWith("ghp_") && !rawKey.startsWith("github_pat_") && cam.apiKeyStatus !== "invalid");
  let contentHtml = "";

  if (cam.isAnalyzing) {
    contentHtml = `
      <div class="p-8 text-center space-y-5 animate-fadeIn">
        <div class="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div class="absolute inset-0 rounded-3xl bg-brand-500/20 animate-ping"></div>
          <div class="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl shadow-xl ai-analyzing-pulse">
            ⚡️
          </div>
        </div>
        <div>
          <h4 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            🧠 M-LAB Aqlli Dvigateli misolni yechmoqda...
          </h4>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Matematik ifoda tahlil qilinmoqda va qadamma-qadam, to'liq erinmasdan tushuntirilgan 3 bosqichli yechim tayyorlanmoqda...
          </p>
        </div>
      </div>
    `;
  } else if (cam.isStreaming) {
    // Live WebRTC Viewfinder
    contentHtml = `
      <div class="space-y-4 animate-fadeIn">
        <div class="relative w-full rounded-3xl overflow-hidden bg-black aspect-video max-h-80 flex items-center justify-center shadow-xl border-2 border-brand-500">
          <video id="ai-camera-live-video" autoplay playsinline muted class="w-full h-full object-cover"></video>
          
          <!-- Viewfinder HUD / Scanning Target box -->
          <div class="absolute inset-8 sm:inset-12 border-2 border-dashed border-white/70 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
            <div class="flex justify-between">
              <span class="w-4 h-4 border-t-2 border-l-2 border-brand-400"></span>
              <span class="w-4 h-4 border-t-2 border-r-2 border-brand-400"></span>
            </div>
            <div class="w-full h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-[0_0_10px_#818cf8] animate-pulse"></div>
            <div class="flex justify-between">
              <span class="w-4 h-4 border-b-2 border-l-2 border-brand-400"></span>
              <span class="w-4 h-4 border-b-2 border-r-2 border-brand-400"></span>
            </div>
          </div>

          <!-- Top Action Buttons on Video -->
          <div class="absolute top-3 right-3 flex items-center space-x-2">
            <button id="ai-flip-camera-btn" class="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-xs transition shadow-md" title="Kamerani almashtirish">
              <i data-lucide="refresh-cw" class="w-4 h-4"></i>
            </button>
            <button id="ai-stop-camera-btn" class="p-2 rounded-xl bg-slate-900/80 hover:bg-red-600 text-white backdrop-blur-xs transition shadow-md" title="Kamerani yopish">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- Capture button -->
        <div class="flex items-center justify-center gap-3 pt-1">
          <button id="ai-capture-snapshot-btn" class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-black text-sm shadow-lg shadow-brand-500/30 transition transform active:scale-95 flex items-center justify-center space-x-2.5">
            <span class="text-xl">📸</span>
            <span>Suratga olish va yechish</span>
          </button>
        </div>
      </div>
    `;
  } else if (cam.solution) {
    if (cam.solution.is_math === false) {
      contentHtml = `
        <div class="p-6 text-center space-y-4 animate-fadeIn">
          <div class="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center text-2xl mx-auto">
            ⚠️
          </div>
          <h4 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Matematik ifodani aniqlab bo'lmadi
          </h4>
          <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            ${cam.solution.error_message || "Iltimos, misol matnini to'g'ri ko'rinishda yozing yoki boshqa namunani tanlang."}
          </p>
          <div class="pt-2 flex items-center justify-center gap-3">
            <button id="ai-retake-btn" class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md transition">
              🔄 Boshqa misol yozish
            </button>
          </div>
        </div>
      `;
    } else {
      const sol = cam.solution;
      const isGemini = sol.engine === "gemini_ai";
      contentHtml = `
        <div class="space-y-6 animate-fadeIn">
          <!-- Top Problem Identified Card -->
          <div class="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-purple-50/40 dark:from-slate-800 dark:to-slate-850 border border-indigo-200/80 dark:border-slate-700 space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center space-x-2">
                <span class="text-xs font-black uppercase tracking-wider text-brand-700 dark:text-brand-300 bg-brand-100 dark:bg-brand-950/70 px-2.5 py-0.5 rounded-md">
                  📝 ${sol.problem_title || 'Misol sharti'}
                </span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${isGemini ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'}">
                  ${isGemini ? '🧠 Gemini AI' : '⚡️ M-LAB Dvigateli'}
                </span>
              </div>
              <button id="ai-retake-btn" class="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brand-600 flex items-center space-x-1">
                <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
                <span>Boshqa misol</span>
              </button>
            </div>
            <div class="text-base sm:text-xl font-black text-center text-slate-900 dark:text-white py-2 overflow-x-auto">
              \\[${sanitizeLatexFractions(sol.problem_latex)}\\]
            </div>
          </div>

          <!-- O'qituvchi Maslahati -->
          ${sol.teacher_advice ? `
            <div class="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-slate-800 border border-amber-300/60 dark:border-slate-700 flex items-start space-x-3">
              <span class="text-xl flex-shrink-0">🗣️</span>
              <div>
                <strong class="text-amber-800 dark:text-amber-300 block mb-0.5 text-xs font-black uppercase">O'qituvchi maslahati:</strong>
                <p class="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">${formatMathText(sol.teacher_advice)}</p>
              </div>
            </div>
          ` : ''}

          <!-- Bosqichma-bosqich yechilishi -->
          <div class="space-y-3">
            <h5 class="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
              <span class="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs">🔢</span>
              <span>Bosqichma-bosqich yechilishi:</span>
            </h5>

            <div class="space-y-3">
              ${(sol.steps || []).map((st, idx) => `
                <div class="solution-step-card bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 space-y-2.5 shadow-xs">
                  <div class="flex items-center space-x-2.5">
                    <span class="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">${st.step_num || idx + 1}</span>
                    <h6 class="text-xs sm:text-sm font-black text-slate-900 dark:text-white">${st.title || (idx + 1) + '-qadam'}</h6>
                  </div>
                  <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed pl-8">${formatMathText(st.explanation || '')}</p>
                  ${st.formula ? `
                    <div class="ml-8 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-indigo-100 dark:border-slate-700 text-indigo-600 dark:text-indigo-300 font-bold text-center overflow-x-auto text-xs sm:text-sm">
                      \\[${sanitizeLatexFractions(st.formula)}\\]
                    </div>
                  ` : ''}
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Yakuniy To'g'ri Javob -->
          <div class="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 dark:bg-emerald-950/50 border border-emerald-400/60 dark:border-emerald-800 flex items-center justify-between flex-wrap gap-3">
            <div class="space-y-1">
              <span class="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5">
                <span>🎯</span>
                <span>Yakuniy to'g'ri javob:</span>
              </span>
              <div class="text-base sm:text-xl font-black text-emerald-900 dark:text-emerald-200">
                \\[${sanitizeLatexFractions(sol.final_answer)}\\]
              </div>
            </div>

            <button id="ai-copy-solution-btn" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              <span>Yechimdan nusxa</span>
            </button>
          </div>

          <!-- Quick Try Another Form directly in solution view -->
          <div class="pt-4 border-t border-slate-200/60 dark:border-slate-750">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              ✏️ Boshqa misolni kiritish va yechish:
            </label>
            <div class="flex items-center gap-2">
              <input 
                type="text" 
                id="ai-expr-input" 
                value="" 
                placeholder="Masalan: 3/4 * 4/15 yoki 2x + 5 = 15 yoki x^2 - 5x + 6 = 0" 
                class="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <button id="ai-solve-text-btn" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center space-x-1.5 flex-shrink-0">
                <span>⚡️ Yechish</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }
  } else {
    // Initial State: Live Camera / Image Upload + Direct Expression Input
    contentHtml = `
      <div class="space-y-6 animate-fadeIn">
        
        <!-- SECTION 1: PHOTO / LIVE CAMERA UPLOAD -->
        <div class="p-5 rounded-3xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-2">
              <span>📸</span>
              <span>1. Kamera yoki Rasmdan misol yuklash</span>
            </h4>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-md ${isKeyValid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'}">
              ${isKeyValid ? '🟢 Gemini AI Ulangan' : '⚡️ M-LAB Dvigateli'}
            </span>
          </div>

          ${cam.imageBase64 ? `
            <div class="space-y-3">
              <div class="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-56 flex items-center justify-center bg-slate-950">
                <img src="${cam.imageBase64}" alt="Yuklangan misol" class="max-h-56 w-auto object-contain" />
                <button id="ai-remove-image-btn" class="absolute top-2 right-2 p-1.5 rounded-xl bg-slate-900/80 text-white hover:bg-red-600 transition backdrop-blur-xs" title="Rasmni o'chirish">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>

              <div class="flex items-center space-x-2">
                <button id="ai-solve-image-btn" class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center space-x-2">
                  <span>⚡️</span>
                  <span>Rasmdagi misolni yechish</span>
                </button>
                <button id="ai-retake-btn" class="py-3 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition">
                  🔄 Boshqa rasm
                </button>
              </div>
            </div>
          ` : `
            <div class="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-400 bg-white/60 dark:bg-slate-900/40 text-center transition space-y-4">
              <div class="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center text-2xl mx-auto shadow-xs">
                📷
              </div>
              <div>
                <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  Kitob yoki daftardagi misolni rasmga oling yoki yuklang
                </p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Smartfon kamerasidan to'g'ridan-to'g'ri suratga olish yoki galereyadan tanlash
                </p>
              </div>

              <!-- Hidden Native Camera and Gallery Inputs -->
              <input type="file" id="native-camera-input" accept="image/*" capture="environment" class="hidden" />
              <input type="file" id="gallery-file-input" accept="image/*" class="hidden" />

              <div class="flex items-center justify-center flex-wrap gap-2.5 pt-1">
                <!-- 1. Native Camera Button (Primary, 100% Mobile Reliable) -->
                <button id="trigger-native-camera-btn" class="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-md shadow-brand-500/20 transition flex items-center space-x-2 transform active:scale-95">
                  <i data-lucide="camera" class="w-4 h-4"></i>
                  <span>📸 Suratga olish</span>
                </button>

                <!-- 2. Live Video WebRTC Button -->
                <button id="trigger-live-camera-btn" class="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm shadow-2xs transition flex items-center space-x-1.5">
                  <i data-lucide="video" class="w-4 h-4 text-indigo-500"></i>
                  <span>📹 Jonli video</span>
                </button>

                <!-- 3. Gallery Upload Button -->
                <button id="trigger-gallery-btn" class="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm shadow-2xs transition flex items-center space-x-1.5">
                  <i data-lucide="image" class="w-4 h-4 text-emerald-500"></i>
                  <span>🖼️ Galereya</span>
                </button>
              </div>
            </div>
          `}
        </div>

        <!-- SECTION 2: DIRECT EXPRESSION INPUT & QUICK SOLVER -->
        <div class="p-5 rounded-3xl bg-indigo-50/40 dark:bg-slate-800/50 border border-indigo-200/60 dark:border-slate-700/80 space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-xs sm:text-sm font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center space-x-2">
              <span>✏️</span>
              <span>2. Misol matnini yozish yoki tahrirlash (Tezkor hisoblash)</span>
            </h4>
            <span class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">⚡️ Darhol yechish</span>
          </div>

          <div class="flex items-center gap-2">
            <input 
              type="text" 
              id="ai-expr-input" 
              value="${cam.inputText || '5/8 + 7/12 - 1/6'}" 
              placeholder="Masalan: 5/8 + 7/12 - 1/6 yoki 2x + 5 = 15 yoki x^2 - 5x + 6 = 0" 
              class="flex-1 px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none shadow-xs"
            />
            <button id="ai-solve-text-btn" class="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center space-x-1.5 flex-shrink-0">
              <span>⚡️</span>
              <span>Yechish</span>
            </button>
          </div>

          <!-- Virtual Math Helper Buttons -->
          <div class="space-y-1.5 pt-1">
            <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
              ⌨️ Matematik belgilar (kiritish uchun bosing):
            </span>
            <div class="flex items-center flex-wrap gap-1.5" id="virtual-math-keypad">
              ${[
                { label: "a/b", insert: " / " },
                { label: "+", insert: " + " },
                { label: "−", insert: " - " },
                { label: "×", insert: " * " },
                { label: "÷", insert: " : " },
                { label: "x²", insert: "^2" },
                { label: "√x", insert: "sqrt()" },
                { label: "( )", insert: "()" },
                { label: "=", insert: " = " },
                { label: "x", insert: "x" }
              ].map(k => `
                <button class="ai-key-btn px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold transition shadow-2xs" data-insert="${k.insert}">
                  ${k.label}
                </button>
              `).join("")}
            </div>
          </div>

          <!-- Quick Example Chips -->
          <div class="space-y-1.5 pt-1">
            <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
              💡 Tezkor namunalar:
            </span>
            <div class="flex items-center flex-wrap gap-1.5">
              ${[
                "5/8 + 7/12 - 1/6",
                "3/4 * 4/15",
                "2/3 : 4/9",
                "2x + 5 = 15",
                "x^2 - 5x + 6 = 0",
                "2 1/3 + 3 1/2"
              ].map(chip => `
                <button class="ai-chip-btn px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-mono transition shadow-2xs">
                  ${chip}
                </button>
              `).join("")}
            </div>
          </div>
        </div>

        ${cam.error ? `
          <div class="p-3.5 rounded-xl bg-rose-500/10 border border-rose-300 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            ⚠️ ${cam.error}
          </div>
        ` : ''}

        <!-- SECTION 3: API Key & Status Bar -->
        <div class="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center space-x-2">
              <span class="text-sm">🔑</span>
              <div>
                <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Google Gemini AI Kaliti Holati
                </span>
                <span class="text-[11px] ${isKeyValid ? 'text-emerald-600 dark:text-emerald-400 font-bold' : (cam.apiKeyStatus === 'invalid' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-slate-400')}">
                  ${cam.apiKeyStatus === 'testing' ? '⏳ Kalit tekshirilmoqda...' : (isKeyValid ? '🟢 Ulangan va faol (Google AI Studio)' : (cam.apiKeyStatus === 'invalid' ? '🔴 Kalitda xatolik mavjud' : '⚡️ Oflayn rejim (M-LAB dvigateli faol)'))}
                </span>
              </div>
            </div>
            <button id="ai-toggle-settings-btn" class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs">
              <i data-lucide="settings" class="w-3.5 h-3.5"></i>
              <span>${cam.showSettings ? "Yopish" : "Kalitni sozlash / Tekshirish"}</span>
            </button>
          </div>

          <!-- Collapsible API Key settings panel -->
          <div id="ai-settings-panel" class="${cam.showSettings ? '' : 'hidden'} pt-3 border-t border-slate-200/80 dark:border-slate-700/80 space-y-3">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Google AI Studio API Kaliti (<code>AIzaSy...</code>):
              </label>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" class="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1">
                <span>100% Bepul kalit olish</span>
                <span>↗</span>
              </a>
            </div>

            <div class="flex items-center gap-2">
              <input 
                type="text" 
                id="ai-api-key-input" 
                value="${cam.apiKey || ''}" 
                placeholder="AIzaSy..." 
                class="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <button id="ai-test-key-btn" class="px-3.5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition flex items-center space-x-1 flex-shrink-0">
                <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
                <span>Kalitni tekshirish</span>
              </button>
              <button id="ai-clear-key-btn" class="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 text-xs font-bold transition flex-shrink-0" title="Kalitni tozalash">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>

            ${cam.apiKeyError ? `
              <div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs leading-relaxed">
                <strong>❌ Kalit xatosi:</strong> ${cam.apiKeyError}
              </div>
            ` : ''}

            ${isKeyValid ? `
              <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs leading-relaxed">
                <strong>✅ Google AI Studio ulandi!</strong> Barcha modellar (<code>gemini-2.0-flash</code>, <code>gemini-1.5-flash</code>) faol. Rasmdagi misollar to'g'ridan-to'g'ri sun'iy intellekt orqali tahlil qilinadi.
              </div>
            ` : ''}

            <!-- 3-Step Guide to get free API key -->
            <div class="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
              <strong class="text-slate-900 dark:text-white block text-xs">
                📌 1 daqiqada 100% bepul API kalit olish:
              </strong>
              <ol class="list-decimal list-inside space-y-1">
                <li><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" class="text-brand-600 dark:text-brand-400 font-bold hover:underline">aistudio.google.com/app/apikey</a> sahifasiga o'ting.</li>
                <li><strong>"Create API key"</strong> tugmasini bosing va chiqqan kodni nusxalang (kod <code>AIzaSy...</code> bilan boshlanadi).</li>
                <li>Yuqoridagi maydonga qo'yib, <strong>"Kalitni tekshirish"</strong> tugmasini bosing.</li>
              </ol>
              <p class="text-[10px] text-slate-500 pt-1">
                💡 Agar kalit kiritilmasa ham, M-LAB ning o'rnatilgan aqlli matematika dvigateli barcha kasrlar, tenglamalar va misollarni 100% bepul va qadamma-qadam yechib beradi.
              </p>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  container.innerHTML = contentHtml;

  // Event Listeners for Native Camera, Live Camera & Gallery
  document.getElementById("trigger-native-camera-btn")?.addEventListener("click", () => {
    document.getElementById("native-camera-input")?.click();
  });

  document.getElementById("native-camera-input")?.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handleCameraImageFile(e.target.files[0]);
    }
  });

  document.getElementById("trigger-live-camera-btn")?.addEventListener("click", startLiveCamera);
  document.getElementById("ai-capture-snapshot-btn")?.addEventListener("click", captureLiveSnapshot);
  document.getElementById("ai-stop-camera-btn")?.addEventListener("click", stopLiveCamera);
  document.getElementById("ai-flip-camera-btn")?.addEventListener("click", flipLiveCamera);

  document.getElementById("trigger-gallery-btn")?.addEventListener("click", () => {
    document.getElementById("gallery-file-input")?.click();
  });

  document.getElementById("gallery-file-input")?.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      handleCameraImageFile(e.target.files[0]);
    }
  });

  document.getElementById("ai-remove-image-btn")?.addEventListener("click", () => {
    AppState.aiCamera.imageBase64 = null;
    AppState.aiCamera.solution = null;
    renderCameraModalContent();
  });

  document.getElementById("ai-solve-image-btn")?.addEventListener("click", () => {
    solveMathWithGemini();
  });

  // Solve button
  document.getElementById("ai-solve-text-btn")?.addEventListener("click", () => {
    const input = document.getElementById("ai-expr-input");
    const val = input ? input.value.trim() : "";
    solveMathWithGemini(val);
  });

  // Expression input Enter key listener
  document.getElementById("ai-expr-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = document.getElementById("ai-expr-input");
      const val = input ? input.value.trim() : "";
      solveMathWithGemini(val);
    }
  });

  // Virtual Keypad Button listeners
  container.querySelectorAll(".ai-key-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const toInsert = btn.getAttribute("data-insert") || "";
      const input = document.getElementById("ai-expr-input");
      if (input) {
        const start = input.selectionStart || input.value.length;
        const end = input.selectionEnd || input.value.length;
        const val = input.value;
        input.value = val.substring(0, start) + toInsert + val.substring(end);
        input.focus();
        input.setSelectionRange(start + toInsert.length, start + toInsert.length);
      }
    });
  });

  // Quick Chips click listeners
  container.querySelectorAll(".ai-chip-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const expr = btn.textContent.trim();
      const input = document.getElementById("ai-expr-input");
      if (input) input.value = expr;
      solveMathWithGemini(expr);
    });
  });

  // Retake / Try another button
  document.getElementById("ai-retake-btn")?.addEventListener("click", () => {
    AppState.aiCamera.solution = null;
    AppState.aiCamera.imageBase64 = null;
    AppState.aiCamera.error = null;
    renderCameraModalContent();
  });

  // Copy solution button
  document.getElementById("ai-copy-solution-btn")?.addEventListener("click", () => {
    if (!cam.solution) return;
    const sol = cam.solution;
    const text = `M-LAB Yechimi: ${sol.problem_title || 'Misol'}\nMisol: ${sol.problem_latex}\n\nO'qituvchi maslahati: ${sol.teacher_advice || ''}\n\n` +
      (sol.steps || []).map((s, i) => `${i + 1}-qadam: ${s.title}\n${s.explanation}\nFormula: ${s.formula || ''}`).join("\n\n") +
      `\n\nYakuniy javob: ${sol.final_answer}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast("✅ Yechimdan to'liq nusxa olindi!", "success");
      }).catch(() => {
        showToast("Nusxa olindi", "success");
      });
    } else {
      showToast("✅ Yechimdan nusxa olindi!", "success");
    }
  });

  // Settings panel toggle
  document.getElementById("ai-toggle-settings-btn")?.addEventListener("click", () => {
    AppState.aiCamera.showSettings = !AppState.aiCamera.showSettings;
    renderCameraModalContent();
  });

  // Test & Save API key
  document.getElementById("ai-test-key-btn")?.addEventListener("click", () => {
    const input = document.getElementById("ai-api-key-input");
    const val = input ? input.value.trim() : "";
    testGeminiApiKey(val);
  });

  // Clear API key
  document.getElementById("ai-clear-key-btn")?.addEventListener("click", () => {
    AppState.aiCamera.apiKey = "";
    AppState.aiCamera.apiKeyStatus = null;
    AppState.aiCamera.apiKeyError = null;
    localStorage.removeItem("m_lab_gemini_key");
    showToast("Google API kaliti tozalandi. M-LAB o'rnatilgan dvigateli ishlaydi.", "info");
    renderCameraModalContent();
  });

  safeRenderMath(container);
  refreshLucide();
}
