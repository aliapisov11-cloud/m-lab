/**
 * M-LAB: Interaktiv kalkulyatorlar va qadam-baqadam hisoblash algoritmlari
 */

// Yordamchi matematik funksiyalar
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    let t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function lcm(a, b) {
  return (!a || !b) ? 0 : Math.abs((a * b) / gcd(a, b));
}

function roundNumber(num, decimals = 4) {
  if (Number.isInteger(num)) return num;
  return Number(Math.round(num + "e" + decimals) + "e-" + decimals);
}

const topicCalculators = {
  // 1. Kasrlar kalkulyatori
  fraction: {
    title: "Kasrlar ustida amallar kalkulyatori",
    renderForm: () => `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">1-kasr</label>
          <div class="flex items-center space-x-2">
            <input type="number" id="calc-num1" value="2" placeholder="Surat" class="w-full px-3 py-2 text-center text-base rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            <span class="text-xl font-bold text-slate-400">/</span>
            <input type="number" id="calc-den1" value="5" placeholder="Maxraj" class="w-full px-3 py-2 text-center text-base rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
        </div>
        <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">2-kasr</label>
          <div class="flex items-center space-x-2">
            <input type="number" id="calc-num2" value="1" placeholder="Surat" class="w-full px-3 py-2 text-center text-base rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            <span class="text-xl font-bold text-slate-400">/</span>
            <input type="number" id="calc-den2" value="3" placeholder="Maxraj" class="w-full px-3 py-2 text-center text-base rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
        </div>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <label class="text-sm font-medium text-slate-600 dark:text-slate-300 mr-2">Amalni tanlang:</label>
        <button type="button" class="calc-op-btn px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-sm transition" data-op="+">+</button>
        <button type="button" class="calc-op-btn px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-indigo-100 transition" data-op="-">-</button>
        <button type="button" class="calc-op-btn px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-indigo-100 transition" data-op="*">×</button>
        <button type="button" class="calc-op-btn px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-indigo-100 transition" data-op="/">÷</button>
      </div>
      <button id="calc-run-btn" class="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition flex items-center justify-center space-x-2">
        <span>Qadam-baqadam hisoblash</span>
      </button>
    `,
    init: (container) => {
      let currentOp = "+";
      const opBtns = container.querySelectorAll(".calc-op-btn");
      opBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          opBtns.forEach(b => {
            b.className = "calc-op-btn px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-indigo-100 transition";
          });
          btn.className = "calc-op-btn px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-sm transition";
          currentOp = btn.getAttribute("data-op");
        });
      });

      container.querySelector("#calc-run-btn").addEventListener("click", () => {
        const num1 = parseInt(container.querySelector("#calc-num1").value) || 0;
        const den1 = parseInt(container.querySelector("#calc-den1").value) || 1;
        const num2 = parseInt(container.querySelector("#calc-num2").value) || 0;
        const den2 = parseInt(container.querySelector("#calc-den2").value) || 1;

        if (den1 === 0 || den2 === 0) {
          showCalcResult(container, "Nolga bo'lish mumkin emas! Maxraj 0 bo'lmasligi kerak.", "error");
          return;
        }

        let resNum = 0, resDen = 1, steps = [];
        const opSymbol = currentOp === "*" ? "\\cdot" : (currentOp === "/" ? ":" : currentOp);

        steps.push(`Berilgan ifoda: \\(\\frac{${num1}}{${den1}} ${opSymbol} \\frac{${num2}}{${den2}}\\)`);

        if (currentOp === "+" || currentOp === "-") {
          const commonDen = lcm(den1, den2);
          const m1 = commonDen / den1;
          const m2 = commonDen / den2;

          steps.push(`1. Umumiy maxrajni topamiz: \\(\\text{EKUK}(${den1}, ${den2}) = ${commonDen}\\)`);
          steps.push(`2. Qo'shimcha ko'paytuvchilar: 1-kasr uchun \\(${m1}\\), 2-kasr uchun \\(${m2}\\).`);
          steps.push(`3. Maxrajga keltiramiz: \\(\\frac{${num1} \\cdot ${m1}}{${commonDen}} ${currentOp} \\frac{${num2} \\cdot ${m2}}{${commonDen}} = \\frac{${num1 * m1} ${currentOp} ${num2 * m2}}{${commonDen}}\\)`);

          if (currentOp === "+") {
            resNum = (num1 * m1) + (num2 * m2);
          } else {
            resNum = (num1 * m1) - (num2 * m2);
          }
          resDen = commonDen;
        } else if (currentOp === "*") {
          steps.push(`1. Suratlarni o'zaro va maxrajlarni o'zaro ko'paytiramiz:`);
          steps.push(`\\(\\frac{${num1} \\cdot ${num2}}{${den1} \\cdot ${den2}}\\)`);
          resNum = num1 * num2;
          resDen = den1 * den2;
        } else if (currentOp === "/") {
          if (num2 === 0) {
            showCalcResult(container, "Nolga bo'lish mumkin emas!", "error");
            return;
          }
          steps.push(`1. Bo'lish amalini ikkinchi kasrni teskarisiga ko'paytirishga aylantiramiz:`);
          steps.push(`\\(\\frac{${num1}}{${den1}} \\cdot \\frac{${den2}}{${num2}} = \\frac{${num1} \\cdot ${den2}}{${den1} \\cdot ${num2}}\\)`);
          resNum = num1 * den2;
          resDen = den1 * num2;
        }

        const g = gcd(resNum, resDen);
        let finalNum = resNum / g;
        let finalDen = resDen / g;
        if (finalDen < 0) {
          finalNum = -finalNum;
          finalDen = -finalDen;
        }

        steps.push(`4. Natija: \\(\\frac{${resNum}}{${resDen}}\\)`);
        if (g > 1) {
          steps.push(`5. Kasrni ${g} ga qisqartiramiz: \\(\\frac{${finalNum}}{${finalDen}}\\)`);
        }
        if (finalDen === 1) {
          steps.push(`6. Butun son ko'rinishida: **${finalNum}**`);
        } else if (Math.abs(finalNum) > finalDen) {
          const whole = Math.trunc(finalNum / finalDen);
          const rem = Math.abs(finalNum % finalDen);
          steps.push(`Aralash kasr ko'rinishida: \\(${whole} \\frac{${rem}}{${finalDen}}\\)`);
        }

        showCalcResult(container, steps, "success");
      });
    }
  },

  // 2. Qisqa ko'paytirish
  shortMultiplication: {
    title: "Qisqa ko'paytirish formulasi hisoblagichi",
    renderForm: () => `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Formula turi</label>
          <select id="calc-sm-type" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500">
            <option value="sq_sum">(a + b)² — Yig'indining kvadrati</option>
            <option value="sq_diff">(a - b)² — Ayirmaning kvadrati</option>
            <option value="diff_sq">a² - b² — Kvadratlar ayirmasi</option>
            <option value="cube_sum">(a + b)³ — Yig'indining kubi</option>
          </select>
        </div>
        <div class="flex space-x-2">
          <div class="flex-1">
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">a qiymati (son yoki koeffitsiyent)</label>
            <input type="number" id="calc-sm-a" value="3" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
          </div>
          <div class="flex-1">
            <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">b qiymati</label>
            <input type="number" id="calc-sm-b" value="4" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
          </div>
        </div>
      </div>
      <button id="calc-run-btn" class="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition">
        Ochib hisoblash
      </button>
    `,
    init: (container) => {
      container.querySelector("#calc-run-btn").addEventListener("click", () => {
        const type = container.querySelector("#calc-sm-type").value;
        const a = parseFloat(container.querySelector("#calc-sm-a").value) || 0;
        const b = parseFloat(container.querySelector("#calc-sm-b").value) || 0;
        let steps = [];

        if (type === "sq_sum") {
          steps.push(`Formula: \\((a+b)^2 = a^2 + 2ab + b^2\\)`);
          steps.push(`Berilgan: \\(a = ${a}, \\; b = ${b}\\)`);
          steps.push(`\\((${a} + ${b})^2 = ${a}^2 + 2 \\cdot ${a} \\cdot ${b} + ${b}^2\\)`);
          const a2 = a * a;
          const ab2 = 2 * a * b;
          const b2 = b * b;
          const total = a2 + ab2 + b2;
          steps.push(`\\(= ${a2} + ${ab2} + ${b2} = ${total}\\)`);
        } else if (type === "sq_diff") {
          steps.push(`Formula: \\((a-b)^2 = a^2 - 2ab + b^2\\)`);
          steps.push(`Berilgan: \\(a = ${a}, \\; b = ${b}\\)`);
          steps.push(`\\((${a} - ${b})^2 = ${a}^2 - 2 \\cdot ${a} \\cdot ${b} + ${b}^2\\)`);
          const a2 = a * a;
          const ab2 = 2 * a * b;
          const b2 = b * b;
          const total = a2 - ab2 + b2;
          steps.push(`\\(= ${a2} - ${ab2} + ${b2} = ${total}\\)`);
        } else if (type === "diff_sq") {
          steps.push(`Formula: \\(a^2 - b^2 = (a - b)(a + b)\\)`);
          steps.push(`Berilgan: \\(a = ${a}, \\; b = ${b}\\)`);
          const diff = a - b;
          const sum = a + b;
          const total = diff * sum;
          steps.push(`\\(${a}^2 - ${b}^2 = (${a} - ${b})(${a} + ${b}) = (${diff}) \\cdot (${sum}) = ${total}\\)`);
        } else if (type === "cube_sum") {
          steps.push(`Formula: \\((a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3\\)`);
          const a3 = a * a * a;
          const a2b = 3 * a * a * b;
          const ab2 = 3 * a * b * b;
          const b3 = b * b * b;
          const total = a3 + a2b + ab2 + b3;
          steps.push(`\\((${a} + ${b})^3 = ${a}^3 + 3 \\cdot ${a}^2 \\cdot ${b} + 3 \\cdot ${a} \\cdot ${b}^2 + ${b}^3\\)`);
          steps.push(`\\(= ${a3} + ${a2b} + ${ab2} + ${b3} = ${total}\\)`);
        }

        showCalcResult(container, steps, "success");
      });
    }
  },

  // 3. Chiziqli tenglama yechgichi
  linearEquation: {
    title: "Chiziqli tenglama yechgichi (ax + b = c)",
    renderForm: () => `
      <div class="flex items-center space-x-2 max-w-md mx-auto">
        <input type="number" id="calc-le-a" value="3" placeholder="a" class="w-20 px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
        <span class="font-bold text-slate-700 dark:text-slate-300">x +</span>
        <input type="number" id="calc-le-b" value="-7" placeholder="b" class="w-20 px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
        <span class="font-bold text-slate-700 dark:text-slate-300">=</span>
        <input type="number" id="calc-le-c" value="5" placeholder="c" class="w-20 px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
      </div>
      <button id="calc-run-btn" class="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition">
        Tenglamani yechish
      </button>
    `,
    init: (container) => {
      container.querySelector("#calc-run-btn").addEventListener("click", () => {
        const a = parseFloat(container.querySelector("#calc-le-a").value);
        const b = parseFloat(container.querySelector("#calc-le-b").value) || 0;
        const c = parseFloat(container.querySelector("#calc-le-c").value) || 0;

        if (isNaN(a)) {
          showCalcResult(container, "Iltimos, a koeffitsiyentini kiriting.", "error");
          return;
        }

        let steps = [];
        const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
        steps.push(`Tenglama: \\(${a}x ${bSign} = ${c}\\)`);

        if (a === 0) {
          if (b === c) {
            steps.push(`\\(0x = 0\\) \\(\\implies\\) **Cheksiz ko'p ildizga ega** (x har qanday son bo'lishi mumkin).`);
          } else {
            steps.push(`\\(0x = ${c - b}\\) \\(\\implies\\) **Ildizga ega emas** (To'g'ri tenglik hosil bo'lmaydi).`);
          }
          showCalcResult(container, steps, "success");
          return;
        }

        const rhs = c - b;
        steps.push(`1. Ozod son \\(${b}\\) ni o'ng tomonga qarama-qarshi ishora bilan o'tkazamiz:`);
        steps.push(`\\(${a}x = ${c} - (${b}) \\implies ${a}x = ${rhs}\\)`);
        const x = roundNumber(rhs / a);
        steps.push(`2. x ni topish uchun o'ng tomonni \\(${a}\\) ga bo'lamiz:`);
        steps.push(`\\(x = \\frac{${rhs}}{${a}} = \\mathbf{${x}}\\)`);

        showCalcResult(container, steps, "success");
      });
    }
  },

  // 4. Kvadrat tenglamalar kalkulyatori
  quadraticEquation: {
    title: "Kvadrat tenglamani yechish (ax² + bx + c = 0)",
    renderForm: () => `
      <div class="flex items-center justify-center space-x-2 flex-wrap gap-y-2">
        <input type="number" id="calc-qe-a" value="1" placeholder="a" class="w-16 px-2 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
        <span class="font-bold text-slate-700 dark:text-slate-300">x² +</span>
        <input type="number" id="calc-qe-b" value="-5" placeholder="b" class="w-16 px-2 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
        <span class="font-bold text-slate-700 dark:text-slate-300">x +</span>
        <input type="number" id="calc-qe-c" value="6" placeholder="c" class="w-16 px-2 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
        <span class="font-bold text-slate-700 dark:text-slate-300">= 0</span>
      </div>
      <button id="calc-run-btn" class="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition">
        Diskriminant va Ildizlarni topish
      </button>
    `,
    init: (container) => {
      container.querySelector("#calc-run-btn").addEventListener("click", () => {
        const a = parseFloat(container.querySelector("#calc-qe-a").value);
        const b = parseFloat(container.querySelector("#calc-qe-b").value) || 0;
        const c = parseFloat(container.querySelector("#calc-qe-c").value) || 0;

        if (!a || a === 0) {
          showCalcResult(container, "a koeffitsiyenti 0 bo'lmasligi kerak (chunki u holda kvadrat tenglama bo'lmay qoladi).", "error");
          return;
        }

        let steps = [];
        steps.push(`Berilgan tenglama: \\(${a}x^2 + (${b})x + (${c}) = 0\\)`);
        steps.push(`Koeffitsiyentlar: \\(a = ${a}, \\; b = ${b}, \\; c = ${c}\\)`);

        const D = (b * b) - (4 * a * c);
        steps.push(`1. Diskriminantni hisoblaymiz:`);
        steps.push(`\\(D = b^2 - 4ac = (${b})^2 - 4 \\cdot (${a}) \\cdot (${c}) = ${b*b} - (${4*a*c}) = \\mathbf{${D}}\\)`);

        if (D > 0) {
          const sqrtD = Math.sqrt(D);
          const x1 = roundNumber((-b + sqrtD) / (2 * a));
          const x2 = roundNumber((-b - sqrtD) / (2 * a));
          steps.push(`2. \\(D > 0\\) bo'lgani uchun tenglama **2 ta haqiqiy ildizga** ega:`);
          steps.push(`\\(\\sqrt{D} = \\sqrt{${D}} = ${roundNumber(sqrtD)}\\)`);
          steps.push(`\\(x_1 = \\frac{-b + \\sqrt{D}}{2a} = \\frac{${-b} + ${roundNumber(sqrtD)}}{2 \\cdot ${a}} = \\mathbf{${x1}}\\)`);
          steps.push(`\\(x_2 = \\frac{-b - \\sqrt{D}}{2a} = \\frac{${-b} - ${roundNumber(sqrtD)}}{2 \\cdot ${a}} = \\mathbf{${x2}}\\)`);
        } else if (D === 0) {
          const x = roundNumber(-b / (2 * a));
          steps.push(`2. \\(D = 0\\) bo'lgani uchun tenglama **bitta (karrali) haqiqiy ildizga** ega:`);
          steps.push(`\\(x = \\frac{-b}{2a} = \\frac{${-b}}{2 \\cdot ${a}} = \\mathbf{${x}}\\)`);
        } else {
          steps.push(`2. \\(D < 0\\) (\\(${D} < 0\\)) bo'lgani sababli tenglama **haqiqiy ildizlarga ega emas**.`);
        }

        showCalcResult(container, steps, "success");
      });
    }
  },

  // 5. Daraja va ildizlar kalkulyatori
  exponent: {
    title: "Daraja va kvadrat ildiz hisoblagichi",
    renderForm: () => `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Darajaga ko'tarish (aⁿ)</label>
          <div class="flex items-center space-x-2">
            <input type="number" id="calc-exp-base" value="2" placeholder="Asos (a)" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
            <span class="font-bold text-slate-400">^</span>
            <input type="number" id="calc-exp-pow" value="5" placeholder="Daraja (n)" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
          </div>
        </div>
        <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Kvadrat ildiz (√x)</label>
          <input type="number" id="calc-exp-sqrt" value="144" placeholder="Son" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
        </div>
      </div>
      <button id="calc-run-btn" class="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition">
        Hisoblash
      </button>
    `,
    init: (container) => {
      container.querySelector("#calc-run-btn").addEventListener("click", () => {
        const base = parseFloat(container.querySelector("#calc-exp-base").value) || 0;
        const pow = parseFloat(container.querySelector("#calc-exp-pow").value) || 0;
        const sqrtVal = parseFloat(container.querySelector("#calc-exp-sqrt").value) || 0;

        let steps = [];
        const powRes = Math.pow(base, pow);
        steps.push(`**1. Darajaga ko'tarish:**`);
        steps.push(`\\(${base}^{${pow}} = \\mathbf{${roundNumber(powRes)}}\\)`);

        steps.push(`**2. Kvadrat ildiz:**`);
        if (sqrtVal < 0) {
          steps.push(`\\(\\sqrt{${sqrtVal}}\\) — Manfiy sondan haqiqiy kvadrat ildiz mavjud emas.`);
        } else {
          const sqrtRes = Math.sqrt(sqrtVal);
          steps.push(`\\(\\sqrt{${sqrtVal}} = \\mathbf{${roundNumber(sqrtRes)}}\\) (chunki \\(${roundNumber(sqrtRes)}^2 = ${sqrtVal}\\))`);
        }

        showCalcResult(container, steps, "success");
      });
    }
  },

  // 6. Progressiyalar kalkulyatori
  progression: {
    title: "Arifmetik va Geometrik progressiya hisoblagichi",
    renderForm: () => `
      <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Turi</label>
          <select id="calc-prog-type" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm">
            <option value="arithmetic">Arifmetik (d)</option>
            <option value="geometric">Geometrik (q)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">1-had (a₁ / b₁)</label>
          <input type="number" id="calc-prog-a1" value="2" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1" id="prog-diff-label">Ayirma (d)</label>
          <input type="number" id="calc-prog-d" value="3" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Hadlar soni (n)</label>
          <input type="number" id="calc-prog-n" value="10" min="1" max="100" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
        </div>
      </div>
      <button id="calc-run-btn" class="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition">
        n-had va Yig'indini hisoblash
      </button>
    `,
    init: (container) => {
      const typeSelect = container.querySelector("#calc-prog-type");
      const diffLabel = container.querySelector("#prog-diff-label");

      typeSelect.addEventListener("change", () => {
        if (typeSelect.value === "arithmetic") {
          diffLabel.textContent = "Ayirma (d)";
        } else {
          diffLabel.textContent = "Maxraj (q)";
        }
      });

      container.querySelector("#calc-run-btn").addEventListener("click", () => {
        const type = typeSelect.value;
        const a1 = parseFloat(container.querySelector("#calc-prog-a1").value) || 0;
        const d = parseFloat(container.querySelector("#calc-prog-d").value) || 0;
        const n = parseInt(container.querySelector("#calc-prog-n").value) || 1;

        if (n < 1) {
          showCalcResult(container, "Hadlar soni (n) kamida 1 bo'lishi kerak.", "error");
          return;
        }

        let steps = [];
        if (type === "arithmetic") {
          steps.push(`**Arifmetik progressiya:** \\(a_1 = ${a1}, \\; d = ${d}, \\; n = ${n}\\)`);
          const an = a1 + (n - 1) * d;
          steps.push(`1. \\(n\\)-had formulasi: \\(a_n = a_1 + (n-1)d\\)`);
          steps.push(`\\(a_{${n}} = ${a1} + (${n}-1) \\cdot ${d} = ${a1} + ${n-1} \\cdot ${d} = \\mathbf{${roundNumber(an)}}\\)`);

          const Sn = ((a1 + an) / 2) * n;
          steps.push(`2. Dastlabki \\(${n}\\) ta had yig'indisi formulasi: \\(S_n = \\frac{a_1 + a_n}{2} \\cdot n\\)`);
          steps.push(`\\(S_{${n}} = \\frac{${a1} + ${roundNumber(an)}}{2} \\cdot ${n} = \\mathbf{${roundNumber(Sn)}}\\)`);
        } else {
          steps.push(`**Geometrik progressiya:** \\(b_1 = ${a1}, \\; q = ${d}, \\; n = ${n}\\)`);
          const bn = a1 * Math.pow(d, n - 1);
          steps.push(`1. \\(n\\)-had formulasi: \\(b_n = b_1 \\cdot q^{n-1}\\)`);
          steps.push(`\\(b_{${n}} = ${a1} \\cdot ${d}^{${n-1}} = \\mathbf{${roundNumber(bn)}}\\)`);

          if (d === 1) {
            const Sn = a1 * n;
            steps.push(`2. \\(q = 1\\) bo'lganda yig'indi: \\(S_n = b_1 \\cdot n = ${a1} \\cdot ${n} = \\mathbf{${Sn}}\\)`);
          } else {
            const Sn = (a1 * (Math.pow(d, n) - 1)) / (d - 1);
            steps.push(`2. Yig'indi formulasi: \\(S_n = \\frac{b_1(q^n - 1)}{q - 1}\\)`);
            steps.push(`\\(S_{${n}} = \\frac{${a1} \\cdot (${d}^{${n}} - 1)}{${d} - 1} = \\mathbf{${roundNumber(Sn)}}\\)`);
          }
        }

        showCalcResult(container, steps, "success");
      });
    }
  },

  // 7. Funksiya va grafiklar
  functionVertex: {
    title: "Parabola uchi va xarakteristikalari (y = ax² + bx + c)",
    renderForm: () => `
      <div class="flex items-center justify-center space-x-2">
        <span class="font-bold text-slate-700 dark:text-slate-300">y =</span>
        <input type="number" id="calc-fn-a" value="1" placeholder="a" class="w-16 px-2 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
        <span class="font-bold text-slate-700 dark:text-slate-300">x² +</span>
        <input type="number" id="calc-fn-b" value="-4" placeholder="b" class="w-16 px-2 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
        <span class="font-bold text-slate-700 dark:text-slate-300">x +</span>
        <input type="number" id="calc-fn-c" value="3" placeholder="c" class="w-16 px-2 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
      </div>
      <button id="calc-run-btn" class="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition">
        Cho'qqi va kesishish nuqtalarini topish
      </button>
    `,
    init: (container) => {
      container.querySelector("#calc-run-btn").addEventListener("click", () => {
        const a = parseFloat(container.querySelector("#calc-fn-a").value);
        const b = parseFloat(container.querySelector("#calc-fn-b").value) || 0;
        const c = parseFloat(container.querySelector("#calc-fn-c").value) || 0;

        if (!a || a === 0) {
          showCalcResult(container, "a ≠ 0 bo'lishi kerak.", "error");
          return;
        }

        let steps = [];
        steps.push(`Funksiya: \\(y = ${a}x^2 + (${b})x + (${c})\\)`);
        const x0 = roundNumber(-b / (2 * a));
        const y0 = roundNumber(a * x0 * x0 + b * x0 + c);

        steps.push(`1. **Parabola uchi (cho'qqisi):**`);
        steps.push(`\\(x_0 = -\\frac{b}{2a} = -\\frac{${b}}{2 \\cdot ${a}} = ${x0}\\)`);
        steps.push(`\\(y_0 = y(${x0}) = ${a}(${x0})^2 + (${b})(${x0}) + (${c}) = ${y0}\\)`);
        steps.push(`Uchining koordinatalari: **(${x0}; ${y0})**`);
        steps.push(`Tarmoqlari yo'nalishi: **${a > 0 ? "Yuqoriga qaragan (minimum)" : "Pastga qaragan (maksimum)"}**`);

        steps.push(`2. **Oy o'qi bilan kesishish:** (x=0) \\(\\implies (0; ${c})\\)`);

        const D = b * b - 4 * a * c;
        if (D > 0) {
          const x1 = roundNumber((-b + Math.sqrt(D)) / (2 * a));
          const x2 = roundNumber((-b - Math.sqrt(D)) / (2 * a));
          steps.push(`3. **Ox o'qi bilan kesishish:** \\((${x1}; 0)\\) va \\((${x2}; 0)\\)`);
        } else if (D === 0) {
          steps.push(`3. **Ox o'qi bilan kesishish:** \\((${x0}; 0)\\) (urinadi)`);
        } else {
          steps.push(`3. **Ox o'qi bilan kesishmaydi** (chunki \\(D < 0\\)).`);
        }

        showCalcResult(container, steps, "success");
      });
    }
  },

  // 8. Logarifm
  logarithm: {
    title: "Logarifm hisoblagichi (log_a b)",
    renderForm: () => `
      <div class="flex items-center justify-center space-x-2 max-w-sm mx-auto">
        <span class="font-bold text-slate-700 dark:text-slate-300">log</span>
        <div>
          <input type="number" id="calc-log-a" value="2" placeholder="a (asos)" class="w-16 px-2 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-xs" />
          <span class="block text-[10px] text-center text-slate-400">asos (a)</span>
        </div>
        <span class="font-bold text-slate-700 dark:text-slate-300">(</span>
        <div>
          <input type="number" id="calc-log-b" value="64" placeholder="b (son)" class="w-24 px-2 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
          <span class="block text-[10px] text-center text-slate-400">argument (b)</span>
        </div>
        <span class="font-bold text-slate-700 dark:text-slate-300">)</span>
      </div>
      <button id="calc-run-btn" class="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition">
        Logarifmni hisoblash
      </button>
    `,
    init: (container) => {
      container.querySelector("#calc-run-btn").addEventListener("click", () => {
        const a = parseFloat(container.querySelector("#calc-log-a").value);
        const b = parseFloat(container.querySelector("#calc-log-b").value);

        if (a <= 0 || a === 1) {
          showCalcResult(container, "Logarifm asosi a > 0 va a ≠ 1 bo'lishi shart.", "error");
          return;
        }
        if (b <= 0) {
          showCalcResult(container, "Logarifm ostidagi son b > 0 bo'lishi shart.", "error");
          return;
        }

        const res = Math.log(b) / Math.log(a);
        let steps = [];
        steps.push(`Hisoblash: \\(\\log_{${a}}(${b})\\)`);
        steps.push(`1. Yangi asosga o'tish qoidasi: \\(\\log_a b = \\frac{\\ln b}{\\ln a}\\)`);
        steps.push(`2. \\(\\frac{\\ln(${b})}{\\ln(${a})} = \\frac{${roundNumber(Math.log(b))}}{${roundNumber(Math.log(a))}} = \\mathbf{${roundNumber(res)}}\\)`);
        steps.push(`Tekshirish: \\(${a}^{${roundNumber(res)}} \\approx ${b}\\)`);

        showCalcResult(container, steps, "success");
      });
    }
  },

  // 9. Trigonometriya
  trigonometry: {
    title: "Trigonometrik funksiyalar hisoblagichi",
    renderForm: () => `
      <div class="max-w-xs mx-auto">
        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Burchak (gradusda)</label>
        <div class="flex items-center space-x-2">
          <input type="number" id="calc-trig-angle" value="30" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
          <span class="text-lg font-bold text-slate-400">°</span>
        </div>
      </div>
      <button id="calc-run-btn" class="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition">
        Sin, Cos, Tg va Ctg hisoblash
      </button>
    `,
    init: (container) => {
      container.querySelector("#calc-run-btn").addEventListener("click", () => {
        const deg = parseFloat(container.querySelector("#calc-trig-angle").value) || 0;
        const rad = (deg * Math.PI) / 180;
        const sinVal = Math.sin(rad);
        const cosVal = Math.cos(rad);

        let steps = [];
        steps.push(`Burchak: \\(\\alpha = ${deg}^\\circ\\) (radianda: \\(${roundNumber(rad)}\\))`);
        steps.push(`\\(\\sin(${deg}^\\circ) = \\mathbf{${roundNumber(sinVal)}}\\)`);
        steps.push(`\\(\\cos(${deg}^\\circ) = \\mathbf{${roundNumber(cosVal)}}\\)`);

        if (Math.abs(cosVal) < 1e-10) {
          steps.push(`\\(\\text{tg}(${deg}^\\circ)\\) mavjud emas (cheksiz).`);
        } else {
          steps.push(`\\(\\text{tg}(${deg}^\\circ) = \\frac{\\sin}{\\cos} = \\mathbf{${roundNumber(sinVal / cosVal)}}\\)`);
        }

        if (Math.abs(sinVal) < 1e-10) {
          steps.push(`\\(\\text{ctg}(${deg}^\\circ)\\) mavjud emas (cheksiz).`);
        } else {
          steps.push(`\\(\\text{ctg}(${deg}^\\circ) = \\frac{\\cos}{\\sin} = \\mathbf{${roundNumber(cosVal / sinVal)}}\\)`);
        }

        showCalcResult(container, steps, "success");
      });
    }
  },

  // 10. Pifagor teoremasi
  pythagoras: {
    title: "Pifagor teoremasi hisoblagichi (c² = a² + b²)",
    renderForm: () => `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Katet (a)</label>
          <input type="number" id="calc-pyth-a" value="3" placeholder="a" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Katet (b)</label>
          <input type="number" id="calc-pyth-b" value="4" placeholder="b" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Gipotenuza (c)</label>
          <input type="number" id="calc-pyth-c" placeholder="Noma'lum" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
        </div>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">Ikkita qiymatni kiriting, uchinchisini bo'sh qoldiring.</p>
      <button id="calc-run-btn" class="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition">
        Hisoblash
      </button>
    `,
    init: (container) => {
      container.querySelector("#calc-run-btn").addEventListener("click", () => {
        const aVal = container.querySelector("#calc-pyth-a").value.trim();
        const bVal = container.querySelector("#calc-pyth-b").value.trim();
        const cVal = container.querySelector("#calc-pyth-c").value.trim();

        const a = parseFloat(aVal);
        const b = parseFloat(bVal);
        const c = parseFloat(cVal);

        let steps = [];

        if (aVal && bVal && !cVal) {
          // Gipotenuza c topiladi
          const cRes = Math.sqrt(a * a + b * b);
          steps.push(`Gipotenuzani topish formulasi: \\(c = \\sqrt{a^2 + b^2}\\)`);
          steps.push(`\\(c = \\sqrt{${a}^2 + ${b}^2} = \\sqrt{${a*a} + ${b*b}} = \\sqrt{${a*a + b*b}} = \\mathbf{${roundNumber(cRes)}}\\)`);
          container.querySelector("#calc-pyth-c").value = roundNumber(cRes);
        } else if (cVal && aVal && !bVal) {
          // Katet b topiladi
          if (c <= a) {
            showCalcResult(container, "Gipotenuza katetdan katta bo'lishi kerak!", "error");
            return;
          }
          const bRes = Math.sqrt(c * c - a * a);
          steps.push(`Katetni topish formulasi: \\(b = \\sqrt{c^2 - a^2}\\)`);
          steps.push(`\\(b = \\sqrt{${c}^2 - ${a}^2} = \\sqrt{${c*c} - ${a*a}} = \\sqrt{${c*c - a*a}} = \\mathbf{${roundNumber(bRes)}}\\)`);
          container.querySelector("#calc-pyth-b").value = roundNumber(bRes);
        } else if (cVal && bVal && !aVal) {
          // Katet a topiladi
          if (c <= b) {
            showCalcResult(container, "Gipotenuza katetdan katta bo'lishi kerak!", "error");
            return;
          }
          const aRes = Math.sqrt(c * c - b * b);
          steps.push(`Katetni topish formulasi: \\(a = \\sqrt{c^2 - b^2}\\)`);
          steps.push(`\\(a = \\sqrt{${c}^2 - ${b}^2} = \\sqrt{${c*c} - ${b*b}} = \\sqrt{${c*c - b*b}} = \\mathbf{${roundNumber(aRes)}}\\)`);
          container.querySelector("#calc-pyth-a").value = roundNumber(aRes);
        } else {
          showCalcResult(container, "Iltimos, aynan 2 ta katakchani to'ldiring va bittasini bo'sh qoldiring.", "error");
          return;
        }

        showCalcResult(container, steps, "success");
      });
    }
  },

  // 11. Uchburchak yuzi
  triangleArea: {
    title: "Uchburchak yuzi hisoblagichi",
    renderForm: () => `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Usulni tanlang</label>
          <select id="calc-tri-method" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm">
            <option value="base_height">Asos (a) va Balandlik (h)</option>
            <option value="heron">Geron formulasi (3 tomon: a, b, c)</option>
          </select>
        </div>
        <div id="tri-inputs-container" class="flex space-x-2">
          <input type="number" id="calc-tri-a" value="10" placeholder="Asos (a)" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
          <input type="number" id="calc-tri-h" value="6" placeholder="Balandlik (h)" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
        </div>
      </div>
      <button id="calc-run-btn" class="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition">
        Yuzani hisoblash
      </button>
    `,
    init: (container) => {
      const methodSelect = container.querySelector("#calc-tri-method");
      const inputsBox = container.querySelector("#tri-inputs-container");

      methodSelect.addEventListener("change", () => {
        if (methodSelect.value === "base_height") {
          inputsBox.innerHTML = `
            <input type="number" id="calc-tri-a" value="10" placeholder="Asos (a)" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
            <input type="number" id="calc-tri-h" value="6" placeholder="Balandlik (h)" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
          `;
        } else {
          inputsBox.innerHTML = `
            <input type="number" id="calc-tri-a" value="13" placeholder="a" class="w-1/3 px-2 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
            <input type="number" id="calc-tri-b" value="14" placeholder="b" class="w-1/3 px-2 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
            <input type="number" id="calc-tri-c" value="15" placeholder="c" class="w-1/3 px-2 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
          `;
        }
      });

      container.querySelector("#calc-run-btn").addEventListener("click", () => {
        const method = methodSelect.value;
        let steps = [];

        if (method === "base_height") {
          const a = parseFloat(container.querySelector("#calc-tri-a").value) || 0;
          const h = parseFloat(container.querySelector("#calc-tri-h").value) || 0;
          if (a <= 0 || h <= 0) {
            showCalcResult(container, "Tomon va balandlik musbat bo'lishi kerak.", "error");
            return;
          }
          const S = 0.5 * a * h;
          steps.push(`Formula: \\(S = \\frac{1}{2} \\cdot a \\cdot h\\)`);
          steps.push(`\\(S = \\frac{1}{2} \\cdot ${a} \\cdot ${h} = \\mathbf{${roundNumber(S)}}\\)`);
        } else {
          const a = parseFloat(container.querySelector("#calc-tri-a").value) || 0;
          const b = parseFloat(container.querySelector("#calc-tri-b").value) || 0;
          const c = parseFloat(container.querySelector("#calc-tri-c").value) || 0;

          if (a <= 0 || b <= 0 || c <= 0 || (a + b <= c) || (a + c <= b) || (b + c <= a)) {
            showCalcResult(container, "Bunday uchburchak mavjud emas! (Ixtiyoriy ikki tomon yig'indisi uchinchisidan katta bo'lishi shart).", "error");
            return;
          }

          const p = (a + b + c) / 2;
          const S = Math.sqrt(p * (p - a) * (p - b) * (p - c));
          steps.push(`Geron formulasi: \\(S = \\sqrt{p(p-a)(p-b)(p-c)}\\)`);
          steps.push(`1. Yarim perimetr: \\(p = \\frac{${a} + ${b} + ${c}}{2} = ${p}\\)`);
          steps.push(`2. \\(S = \\sqrt{${p}(${p}-${a})(${p}-${b})(${p}-${c})} = \\sqrt{${p} \\cdot ${p-a} \\cdot ${p-b} \\cdot ${p-c}} = \\mathbf{${roundNumber(S)}}\\)`);
        }

        showCalcResult(container, steps, "success");
      });
    }
  },

  // 12. To'rtburchaklar yuzi
  quadrilateralArea: {
    title: "To'rtburchaklar yuzi hisoblagichi",
    renderForm: () => `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Shakl turi</label>
          <select id="calc-quad-type" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm">
            <option value="rectangle">To'g'ri to'rtburchak (a, b)</option>
            <option value="square">Kvadrat (a)</option>
            <option value="trapezoid">Trapetsiya (a, b asoslar va h balandlik)</option>
            <option value="rhombus">Romb (d1, d2 diagonallar)</option>
          </select>
        </div>
        <div id="quad-inputs-box" class="flex space-x-2">
          <input type="number" id="calc-q-1" value="6" placeholder="Bo'yi (a)" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
          <input type="number" id="calc-q-2" value="4" placeholder="Eni (b)" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
        </div>
      </div>
      <button id="calc-run-btn" class="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition">
        Hisoblash
      </button>
    `,
    init: (container) => {
      const typeSelect = container.querySelector("#calc-quad-type");
      const inputsBox = container.querySelector("#quad-inputs-box");

      typeSelect.addEventListener("change", () => {
        const val = typeSelect.value;
        if (val === "rectangle") {
          inputsBox.innerHTML = `
            <input type="number" id="calc-q-1" value="6" placeholder="Bo'yi (a)" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
            <input type="number" id="calc-q-2" value="4" placeholder="Eni (b)" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
          `;
        } else if (val === "square") {
          inputsBox.innerHTML = `
            <input type="number" id="calc-q-1" value="5" placeholder="Tomoni (a)" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
          `;
        } else if (val === "trapezoid") {
          inputsBox.innerHTML = `
            <input type="number" id="calc-q-1" value="6" placeholder="Asos a" class="w-1/3 px-2 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
            <input type="number" id="calc-q-2" value="10" placeholder="Asos b" class="w-1/3 px-2 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
            <input type="number" id="calc-q-3" value="4" placeholder="Balandlik h" class="w-1/3 px-2 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
          `;
        } else if (val === "rhombus") {
          inputsBox.innerHTML = `
            <input type="number" id="calc-q-1" value="8" placeholder="Diagonal d1" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
            <input type="number" id="calc-q-2" value="6" placeholder="Diagonal d2" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
          `;
        }
      });

      container.querySelector("#calc-run-btn").addEventListener("click", () => {
        const val = typeSelect.value;
        let steps = [];

        if (val === "rectangle") {
          const a = parseFloat(container.querySelector("#calc-q-1").value) || 0;
          const b = parseFloat(container.querySelector("#calc-q-2").value) || 0;
          steps.push(`To'g'ri to'rtburchak: \\(S = a \\cdot b, \\quad P = 2(a+b)\\)`);
          steps.push(`\\(S = ${a} \\cdot ${b} = \\mathbf{${roundNumber(a * b)}}\\)`);
          steps.push(`\\(P = 2(${a} + ${b}) = \\mathbf{${roundNumber(2 * (a + b))}}\\)`);
        } else if (val === "square") {
          const a = parseFloat(container.querySelector("#calc-q-1").value) || 0;
          steps.push(`Kvadrat: \\(S = a^2, \\quad P = 4a\\)`);
          steps.push(`\\(S = ${a}^2 = \\mathbf{${roundNumber(a * a)}}\\)`);
          steps.push(`\\(P = 4 \\cdot ${a} = \\mathbf{${roundNumber(4 * a)}}\\)`);
        } else if (val === "trapezoid") {
          const a = parseFloat(container.querySelector("#calc-q-1").value) || 0;
          const b = parseFloat(container.querySelector("#calc-q-2").value) || 0;
          const h = parseFloat(container.querySelector("#calc-q-3").value) || 0;
          const S = ((a + b) / 2) * h;
          steps.push(`Trapetsiya: \\(S = \\frac{a+b}{2} \\cdot h\\)`);
          steps.push(`\\(S = \\frac{${a} + ${b}}{2} \\cdot ${h} = \\mathbf{${roundNumber(S)}}\\)`);
        } else if (val === "rhombus") {
          const d1 = parseFloat(container.querySelector("#calc-q-1").value) || 0;
          const d2 = parseFloat(container.querySelector("#calc-q-2").value) || 0;
          const S = 0.5 * d1 * d2;
          steps.push(`Romb: \\(S = \\frac{d_1 \\cdot d_2}{2}\\)`);
          steps.push(`\\(S = \\frac{${d1} \\cdot ${d2}}{2} = \\mathbf{${roundNumber(S)}}\\)`);
        }

        showCalcResult(container, steps, "success");
      });
    }
  },

  // 13. Aylana va doira
  circleCalculator: {
    title: "Aylana va Doira hisoblagichi",
    renderForm: () => `
      <div class="max-w-xs mx-auto">
        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Doira Radiusi (R)</label>
        <input type="number" id="calc-circ-r" value="5" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
      </div>
      <button id="calc-run-btn" class="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition">
        Uzunlik (C) va Yuza (S) ni hisoblash
      </button>
    `,
    init: (container) => {
      container.querySelector("#calc-run-btn").addEventListener("click", () => {
        const R = parseFloat(container.querySelector("#calc-circ-r").value) || 0;
        if (R <= 0) {
          showCalcResult(container, "Radius musbat bo'lishi kerak.", "error");
          return;
        }

        const C = 2 * Math.PI * R;
        const S = Math.PI * R * R;
        let steps = [];
        steps.push(`Radius: \\(R = ${R}\\), Diametr: \\(D = ${2 * R}\\)`);
        steps.push(`1. **Aylana uzunligi:** \\(C = 2\\pi R = 2 \\cdot \\pi \\cdot ${R} = ${2 * R}\\pi \\approx \\mathbf{${roundNumber(C)}}\\)`);
        steps.push(`2. **Doira yuzi:** \\(S = \\pi R^2 = \\pi \\cdot ${R}^2 = ${R * R}\\pi \\approx \\mathbf{${roundNumber(S)}}\\)`);

        showCalcResult(container, steps, "success");
      });
    }
  },

  // 14. Burchaklar
  angleCalculator: {
    title: "Burchaklar kalkulyatori (Qo'shni va vertikal)",
    renderForm: () => `
      <div class="max-w-xs mx-auto">
        <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Berilgan burchak (α)</label>
        <div class="flex items-center space-x-2">
          <input type="number" id="calc-ang-val" value="65" min="1" max="179" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
          <span class="text-lg font-bold text-slate-400">°</span>
        </div>
      </div>
      <button id="calc-run-btn" class="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition">
        Bog'liq burchaklarni aniqlash
      </button>
    `,
    init: (container) => {
      container.querySelector("#calc-run-btn").addEventListener("click", () => {
        const alpha = parseFloat(container.querySelector("#calc-ang-val").value) || 0;
        if (alpha <= 0 || alpha >= 180) {
          showCalcResult(container, "Burchak 0° va 180° oralig'ida bo'lishi kerak.", "error");
          return;
        }

        const beta = 180 - alpha;
        let steps = [];
        steps.push(`Berilgan burchak: \\(\\alpha = ${alpha}^\\circ\\)`);
        steps.push(`1. **Vertikal burchak:** \\(\\gamma = \\alpha = \\mathbf{${alpha}^\\circ}\\) (o'zaro teng).`);
        steps.push(`2. **Qo'shni burchak:** \\(\\beta = 180^\\circ - ${alpha}^\\circ = \\mathbf{${beta}^\\circ}\\).`);
        steps.push(`3. **Burchak turi:** \\(${alpha < 90 ? "O'tkir burchak (< 90°)" : (alpha === 90 ? "To'g'ri burchak (= 90°)" : "O'tmas burchak (> 90°)")}\\).`);

        showCalcResult(container, steps, "success");
      });
    }
  },

  // 15. Kosinuslar teoremasi
  lawOfCosines: {
    title: "Kosinuslar teoremasi (3-tomonni topish)",
    renderForm: () => `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Tomon (b)</label>
          <input type="number" id="calc-cos-b" value="5" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Tomon (c)</label>
          <input type="number" id="calc-cos-c" value="8" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Burchak (A, gradus)</label>
          <input type="number" id="calc-cos-ang" value="60" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
        </div>
      </div>
      <button id="calc-run-btn" class="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition">
        Uchinchi tomon (a) ni topish
      </button>
    `,
    init: (container) => {
      container.querySelector("#calc-run-btn").addEventListener("click", () => {
        const b = parseFloat(container.querySelector("#calc-cos-b").value) || 0;
        const c = parseFloat(container.querySelector("#calc-cos-c").value) || 0;
        const deg = parseFloat(container.querySelector("#calc-cos-ang").value) || 0;

        if (b <= 0 || c <= 0 || deg <= 0 || deg >= 180) {
          showCalcResult(container, "Tomonlar musbat va burchak 0°-180° oralig'ida bo'lishi kerak.", "error");
          return;
        }

        const rad = (deg * Math.PI) / 180;
        const cosVal = Math.cos(rad);
        const aSq = b * b + c * c - 2 * b * c * cosVal;
        const a = Math.sqrt(aSq);

        let steps = [];
        steps.push(`Formula: \\(a^2 = b^2 + c^2 - 2bc\\cos A\\)`);
        steps.push(`\\(\\cos(${deg}^\\circ) = ${roundNumber(cosVal)}\\)`);
        steps.push(`\\(a^2 = ${b}^2 + ${c}^2 - 2 \\cdot ${b} \\cdot ${c} \\cdot (${roundNumber(cosVal)}) = ${b*b} + ${c*c} - ${roundNumber(2*b*c*cosVal)} = ${roundNumber(aSq)}\\)`);
        steps.push(`\\(a = \\sqrt{${roundNumber(aSq)}} = \\mathbf{${roundNumber(a)}}\\)`);

        showCalcResult(container, steps, "success");
      });
    }
  },

  // 16. Fazoviy jismlar (Kub va Parallelepiped)
  prismCube: {
    title: "Kub va Parallelepiped hajmi hisoblagichi",
    renderForm: () => `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Uzunligi (a)</label>
          <input type="number" id="calc-3d-a" value="8" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Eni (b)</label>
          <input type="number" id="calc-3d-b" value="4" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Balandligi (c)</label>
          <input type="number" id="calc-3d-c" value="5" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
        </div>
      </div>
      <button id="calc-run-btn" class="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition">
        Hajmi va To'la sirtini hisoblash
      </button>
    `,
    init: (container) => {
      container.querySelector("#calc-run-btn").addEventListener("click", () => {
        const a = parseFloat(container.querySelector("#calc-3d-a").value) || 0;
        const b = parseFloat(container.querySelector("#calc-3d-b").value) || 0;
        const c = parseFloat(container.querySelector("#calc-3d-c").value) || 0;

        if (a <= 0 || b <= 0 || c <= 0) {
          showCalcResult(container, "O'lchamlar musbat bo'lishi kerak.", "error");
          return;
        }

        const V = a * b * c;
        const S = 2 * (a * b + b * c + a * c);
        const d = Math.sqrt(a * a + b * b + c * c);

        let steps = [];
        steps.push(`O'lchamlar: \\(a = ${a}, \\; b = ${b}, \\; c = ${c}\\)`);
        steps.push(`1. **Hajmi (V):** \\(V = a \\cdot b \\cdot c = ${a} \\cdot ${b} \\cdot ${c} = \\mathbf{${roundNumber(V)}}\\)`);
        steps.push(`2. **To'la sirt yuzi (S):** \\(S = 2(ab + bc + ac) = 2(${a*b} + ${b*c} + ${a*c}) = \\mathbf{${roundNumber(S)}}\\)`);
        steps.push(`3. **Fazoviy bosh diagonali (d):** \\(d = \\sqrt{a^2 + b^2 + c^2} = \\mathbf{${roundNumber(d)}}\\)`);

        showCalcResult(container, steps, "success");
      });
    }
  },

  // 17. Aylanma jismlar
  roundBodiesCalc: {
    title: "Silindr, Konus va Shar hisoblagichi",
    renderForm: () => `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Jism turi</label>
          <select id="calc-rb-type" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm">
            <option value="cylinder">Silindr (R, H)</option>
            <option value="cone">Konus (R, H)</option>
            <option value="sphere">Shar (R)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Radius (R)</label>
          <input type="number" id="calc-rb-r" value="3" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
        </div>
        <div id="rb-h-box">
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Balandlik (H)</label>
          <input type="number" id="calc-rb-h" value="5" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm" />
        </div>
      </div>
      <button id="calc-run-btn" class="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition">
        Hajm va Sirtni hisoblash
      </button>
    `,
    init: (container) => {
      const typeSelect = container.querySelector("#calc-rb-type");
      const hBox = container.querySelector("#rb-h-box");

      typeSelect.addEventListener("change", () => {
        if (typeSelect.value === "sphere") {
          hBox.style.display = "none";
        } else {
          hBox.style.display = "block";
        }
      });

      container.querySelector("#calc-run-btn").addEventListener("click", () => {
        const type = typeSelect.value;
        const R = parseFloat(container.querySelector("#calc-rb-r").value) || 0;
        const H = parseFloat(container.querySelector("#calc-rb-h")?.value) || 0;

        if (R <= 0 || (type !== "sphere" && H <= 0)) {
          showCalcResult(container, "Radius va balandlik musbat bo'lishi kerak.", "error");
          return;
        }

        let steps = [];
        if (type === "cylinder") {
          const V = Math.PI * R * R * H;
          const Syon = 2 * Math.PI * R * H;
          const Stola = 2 * Math.PI * R * (R + H);
          steps.push(`Silindr: \\(R = ${R}, \\; H = ${H}\\)`);
          steps.push(`1. **Hajmi:** \\(V = \\pi R^2 H = \\pi \\cdot ${R}^2 \\cdot ${H} = ${R*R*H}\\pi \\approx \\mathbf{${roundNumber(V)}}\\)`);
          steps.push(`2. **Yon sirti:** \\(S_{yon} = 2\\pi RH = 2\\pi \\cdot ${R} \\cdot ${H} = ${2*R*H}\\pi \\approx \\mathbf{${roundNumber(Syon)}}\\)`);
          steps.push(`3. **To'la sirti:** \\(S_{to'la} = 2\\pi R(R+H) = \\mathbf{${roundNumber(Stola)}}\\)`);
        } else if (type === "cone") {
          const V = (1 / 3) * Math.PI * R * R * H;
          const L = Math.sqrt(R * R + H * H);
          const Syon = Math.PI * R * L;
          steps.push(`Konus: \\(R = ${R}, \\; H = ${H}\\)`);
          steps.push(`1. **Yasovchisi (L):** \\(L = \\sqrt{R^2 + H^2} = \\sqrt{${R*R} + ${H*H}} = \\mathbf{${roundNumber(L)}}\\)`);
          steps.push(`2. **Hajmi:** \\(V = \\frac{1}{3}\\pi R^2 H = \\mathbf{${roundNumber(V)}}\\)`);
          steps.push(`3. **Yon sirti:** \\(S_{yon} = \\pi R L = \\mathbf{${roundNumber(Syon)}}\\)`);
        } else if (type === "sphere") {
          const V = (4 / 3) * Math.PI * Math.pow(R, 3);
          const S = 4 * Math.PI * R * R;
          steps.push(`Shar: \\(R = ${R}\\)`);
          steps.push(`1. **Hajmi:** \\(V = \\frac{4}{3}\\pi R^3 = \\frac{4}{3}\\pi \\cdot ${R}^3 = \\mathbf{${roundNumber(V)}}\\)`);
          steps.push(`2. **Sirt yuzi:** \\(S = 4\\pi R^2 = 4\\pi \\cdot ${R}^2 = ${4*R*R}\\pi \\approx \\mathbf{${roundNumber(S)}}\\)`);
        }

        showCalcResult(container, steps, "success");
      });
    }
  },

  // 18. Vektorlar
  vectorCalculator: {
    title: "Vektorlar moduli va skalyar ko'paytmasi",
    renderForm: () => `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Vektor a (x₁, y₁)</label>
          <div class="flex items-center space-x-2">
            <input type="number" id="calc-vec-x1" value="3" placeholder="x1" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
            <input type="number" id="calc-vec-y1" value="4" placeholder="y1" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
          </div>
        </div>
        <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <label class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Vektor b (x₂, y₂)</label>
          <div class="flex items-center space-x-2">
            <input type="number" id="calc-vec-x2" value="4" placeholder="x2" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
            <input type="number" id="calc-vec-y2" value="-3" placeholder="y2" class="w-full px-3 py-2 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white" />
          </div>
        </div>
      </div>
      <button id="calc-run-btn" class="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md transition">
        Modul va Ko'paytmani hisoblash
      </button>
    `,
    init: (container) => {
      container.querySelector("#calc-run-btn").addEventListener("click", () => {
        const x1 = parseFloat(container.querySelector("#calc-vec-x1").value) || 0;
        const y1 = parseFloat(container.querySelector("#calc-vec-y1").value) || 0;
        const x2 = parseFloat(container.querySelector("#calc-vec-x2").value) || 0;
        const y2 = parseFloat(container.querySelector("#calc-vec-y2").value) || 0;

        const modA = Math.sqrt(x1 * x1 + y1 * y1);
        const modB = Math.sqrt(x2 * x2 + y2 * y2);
        const dotProd = x1 * x2 + y1 * y2;

        let steps = [];
        steps.push(`Vektorlar: \\(\\vec{a} = (${x1}; ${y1})\\), \\(\\vec{b} = (${x2}; ${y2})\\)`);
        steps.push(`1. \\(|\\vec{a}| = \\sqrt{${x1}^2 + ${y1}^2} = \\sqrt{${x1*x1 + y1*y1}} = \\mathbf{${roundNumber(modA)}}\\)`);
        steps.push(`2. \\(|\\vec{b}| = \\sqrt{${x2}^2 + ${y2}^2} = \\sqrt{${x2*x2 + y2*y2}} = \\mathbf{${roundNumber(modB)}}\\)`);
        steps.push(`3. **Skalyar ko'paytma:** \\(\\vec{a} \\cdot \\vec{b} = x_1 x_2 + y_1 y_2 = (${x1})(${x2}) + (${y1})(${y2}) = ${x1*x2} + (${y1*y2}) = \\mathbf{${roundNumber(dotProd)}}\\)`);

        if (dotProd === 0) {
          steps.push(`Skalyar ko'paytma 0 bo'lgani uchun vektorlar **o'zaro perpendikulyar (90°)**.`);
        }

        showCalcResult(container, steps, "success");
      });
    }
  }
};

function showCalcResult(container, content, status = "success") {
  let resBox = container.querySelector(".calc-result-box");
  if (!resBox) {
    resBox = document.createElement("div");
    resBox.className = "calc-result-box mt-4 p-4 rounded-xl border transition-all animate-fadeIn";
    container.appendChild(resBox);
  }

  if (status === "error") {
    resBox.className = "calc-result-box mt-4 p-4 rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-sm font-medium animate-fadeIn";
    resBox.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span>${content}</span>
      </div>
    `;
    return;
  }

  resBox.className = "calc-result-box mt-4 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/70 dark:bg-emerald-950/20 text-slate-800 dark:text-slate-200 text-sm animate-fadeIn space-y-2";

  let html = `<div class="font-bold text-emerald-700 dark:text-emerald-400 flex items-center space-x-2 border-b border-emerald-200 dark:border-emerald-800/40 pb-2 mb-2">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    <span>Qadam-baqadam yechim:</span>
  </div>`;

  if (Array.isArray(content)) {
    html += content.map(step => `<div class="py-1 leading-relaxed">${step}</div>`).join("");
  } else {
    html += `<div>${content}</div>`;
  }

  resBox.innerHTML = html;

  // Re-render LaTeX inside result box if KaTeX is present
  if (window.renderMathInElement) {
    window.renderMathInElement(resBox, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ],
      throwOnError: false
    });
  }
}
