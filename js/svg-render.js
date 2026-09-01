/**
 * M-LAB: Geometriya mavzulari uchun interaktiv va chiroyli SVG chizmalar
 */

const svgTemplates = {
  // To'g'ri burchakli uchburchak
  rightTriangle: () => `
    <div class="flex flex-col items-center justify-center p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
      <svg viewBox="0 0 320 220" class="w-full max-w-[280px] h-auto geom-svg" xmlns="http://www.w3.org/2000/svg">
        <!-- Grid background subtle -->
        <defs>
          <linearGradient id="triGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#818cf8" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0.05" />
          </linearGradient>
        </defs>
        
        <!-- Triangle Polygon -->
        <polygon points="50,180 270,180 50,40" fill="url(#triGrad)" stroke="#4f46e5" stroke-width="2.5" stroke-linejoin="round" class="geom-shape-main" />
        
        <!-- Right angle mark -->
        <rect x="50" y="160" width="20" height="20" fill="none" stroke="#6366f1" stroke-width="2" />
        <circle cx="60" cy="170" r="2" fill="#6366f1" />

        <!-- Vertices labels -->
        <text x="35" y="195" class="text-xs font-bold fill-slate-700 dark:fill-slate-200">C (90°)</text>
        <text x="35" y="35" class="text-xs font-bold fill-slate-700 dark:fill-slate-200">A</text>
        <text x="275" y="195" class="text-xs font-bold fill-slate-700 dark:fill-slate-200">B</text>

        <!-- Sides labels -->
        <!-- Katet a (vertical) -->
        <text x="25" y="115" class="text-sm font-extrabold fill-indigo-600 dark:fill-indigo-400">a (katet)</text>
        <!-- Katet b (horizontal) -->
        <text x="145" y="202" class="text-sm font-extrabold fill-indigo-600 dark:fill-indigo-400">b (katet)</text>
        <!-- Gipotenuza c (hypotenuse) -->
        <text x="175" y="100" class="text-sm font-extrabold fill-violet-600 dark:fill-violet-400">c (gipotenuza)</text>
      </svg>
      <span class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 text-center">To'g'ri burchakli uchburchak: \\(c^2 = a^2 + b^2\\)</span>
    </div>
  `,

  // Ixtiyoriy uchburchak va balandlik
  generalTriangle: () => `
    <div class="flex flex-col items-center justify-center p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
      <svg viewBox="0 0 320 220" class="w-full max-w-[280px] h-auto geom-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="genTriGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#34d399" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#059669" stop-opacity="0.05" />
          </linearGradient>
        </defs>

        <!-- Triangle -->
        <polygon points="40,180 280,180 180,40" fill="url(#genTriGrad)" stroke="#059669" stroke-width="2.5" stroke-linejoin="round" class="geom-shape-main" />

        <!-- Height line -->
        <line x1="180" y1="40" x2="180" y2="180" stroke="#dc2626" stroke-width="2" stroke-dasharray="4,4" />
        <rect x="180" y="166" width="14" height="14" fill="none" stroke="#dc2626" stroke-width="1.5" />

        <!-- Labels -->
        <text x="185" y="115" class="text-xs font-bold fill-red-600">h (balandlik)</text>
        <text x="150" y="200" class="text-sm font-extrabold fill-emerald-700 dark:fill-emerald-400">a (asos)</text>
        <text x="95" y="100" class="text-xs font-semibold fill-slate-600 dark:fill-slate-300">b</text>
        <text x="240" y="100" class="text-xs font-semibold fill-slate-600 dark:fill-slate-300">c</text>
      </svg>
      <span class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 text-center">Uchburchak yuzi: \\(S = \\frac{1}{2}ah\\) yoki Geron formulasi</span>
    </div>
  `,

  // To'rtburchaklar (Trapetsiya & Parallelogramm)
  quadrilaterals: () => `
    <div class="flex flex-col items-center justify-center p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/40">
      <svg viewBox="0 0 320 200" class="w-full max-w-[280px] h-auto geom-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="trapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#d97706" stop-opacity="0.05" />
          </linearGradient>
        </defs>

        <!-- Trapezoid -->
        <polygon points="80,50 240,50 280,160 40,160" fill="url(#trapGrad)" stroke="#d97706" stroke-width="2.5" stroke-linejoin="round" class="geom-shape-main" />

        <!-- Height line -->
        <line x1="80" y1="50" x2="80" y2="160" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,4" />
        <rect x="80" y="146" width="14" height="14" fill="none" stroke="#ef4444" stroke-width="1.5" />

        <!-- Labels -->
        <text x="150" y="42" class="text-sm font-extrabold fill-amber-700 dark:fill-amber-400">a (kichik asos)</text>
        <text x="150" y="180" class="text-sm font-extrabold fill-amber-700 dark:fill-amber-400">b (katta asos)</text>
        <text x="86" y="110" class="text-xs font-bold fill-red-600">h</text>
      </svg>
      <span class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 text-center">Trapetsiya yuzi: \\(S = \\frac{a+b}{2} \\cdot h\\)</span>
    </div>
  `,

  // Aylana va Doira
  circleDiagram: () => `
    <div class="flex flex-col items-center justify-center p-4 bg-cyan-50/50 dark:bg-cyan-950/20 rounded-2xl border border-cyan-100 dark:border-cyan-900/40">
      <svg viewBox="0 0 320 220" class="w-full max-w-[260px] h-auto geom-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="circGrad">
            <stop offset="70%" stop-color="#06b6d4" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#0891b2" stop-opacity="0.35" />
          </radialGradient>
        </defs>

        <!-- Circle -->
        <circle cx="160" cy="110" r="80" fill="url(#circGrad)" stroke="#0891b2" stroke-width="2.5" class="geom-shape-main" />

        <!-- Center O -->
        <circle cx="160" cy="110" r="4" fill="#0e7490" />
        <text x="150" y="105" class="text-xs font-bold fill-slate-700 dark:fill-slate-200">O</text>

        <!-- Radius line -->
        <line x1="160" y1="110" x2="240" y2="110" stroke="#0e7490" stroke-width="2.5" />
        <text x="195" y="102" class="text-sm font-extrabold fill-cyan-700 dark:fill-cyan-300">R</text>

        <!-- Diameter line (dashed) -->
        <line x1="80" y1="110" x2="160" y2="110" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4,4" />
        <text x="110" y="125" class="text-xs font-semibold fill-slate-500">D = 2R</text>
      </svg>
      <span class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 text-center">Uzunlik: \\(C = 2\\pi R\\), Yuza: \\(S = \\pi R^2\\)</span>
    </div>
  `,

  // Burchaklar va to'g'ri chiziqlar
  anglesDiagram: () => `
    <div class="flex flex-col items-center justify-center p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/40">
      <svg viewBox="0 0 320 200" class="w-full max-w-[280px] h-auto geom-svg" xmlns="http://www.w3.org/2000/svg">
        <!-- Intersecting lines -->
        <line x1="40" y1="160" x2="280" y2="40" stroke="#7e22ce" stroke-width="2.5" />
        <line x1="40" y1="40" x2="280" y2="160" stroke="#7e22ce" stroke-width="2.5" />
        <circle cx="160" cy="100" r="4" fill="#6b21a8" />

        <!-- Angle labels -->
        <text x="195" y="105" class="text-sm font-extrabold fill-purple-700 dark:fill-purple-300">α</text>
        <text x="115" y="105" class="text-sm font-extrabold fill-purple-700 dark:fill-purple-300">γ = α</text>
        <text x="155" y="70" class="text-sm font-extrabold fill-indigo-600 dark:fill-indigo-400">β</text>
        <text x="155" y="145" class="text-sm font-extrabold fill-indigo-600 dark:fill-indigo-400">δ = β</text>
      </svg>
      <span class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 text-center">Qo'shni: \\(\\alpha + \\beta = 180^\\circ\\), Vertikal: \\(\\alpha = \\gamma\\)</span>
    </div>
  `,

  // Sinuslar va Kosinuslar teoremalari
  obliqueTriangle: () => `
    <div class="flex flex-col items-center justify-center p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/40">
      <svg viewBox="0 0 320 220" class="w-full max-w-[280px] h-auto geom-svg" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,170 270,170 120,40" fill="rgba(244, 63, 94, 0.12)" stroke="#e11d48" stroke-width="2.5" stroke-linejoin="round" class="geom-shape-main" />

        <!-- Angle A -->
        <text x="65" y="160" class="text-xs font-bold fill-rose-700 dark:fill-rose-300">A</text>
        <!-- Angle B -->
        <text x="245" y="160" class="text-xs font-bold fill-rose-700 dark:fill-rose-300">B</text>
        <!-- Angle C -->
        <text x="120" y="60" class="text-xs font-bold fill-rose-700 dark:fill-rose-300">C</text>

        <!-- Sides opposite to angles -->
        <text x="200" y="100" class="text-sm font-extrabold fill-rose-600">a</text>
        <text x="70" y="100" class="text-sm font-extrabold fill-rose-600">b</text>
        <text x="160" y="190" class="text-sm font-extrabold fill-rose-600">c</text>
      </svg>
      <span class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 text-center">\\(a^2 = b^2 + c^2 - 2bc\\cos A\\)</span>
    </div>
  `,

  // Fazoviy shakllar 1 (Kub / Parallelepiped)
  cubePrism: () => `
    <div class="flex flex-col items-center justify-center p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40">
      <svg viewBox="0 0 320 220" class="w-full max-w-[280px] h-auto geom-svg" xmlns="http://www.w3.org/2000/svg">
        <!-- 3D Box / Parallelepiped -->
        <!-- Back hidden lines -->
        <line x1="90" y1="120" x2="210" y2="120" stroke="#93c5fd" stroke-width="1.5" stroke-dasharray="4,4" />
        <line x1="90" y1="120" x2="90" y2="40" stroke="#93c5fd" stroke-width="1.5" stroke-dasharray="4,4" />
        <line x1="90" y1="120" x2="40" y2="170" stroke="#93c5fd" stroke-width="1.5" stroke-dasharray="4,4" />

        <!-- Front face -->
        <rect x="40" y="90" width="120" height="80" fill="rgba(37, 99, 235, 0.15)" stroke="#2563eb" stroke-width="2.5" />

        <!-- Top face -->
        <polygon points="40,90 90,40 210,40 160,90" fill="rgba(37, 99, 235, 0.25)" stroke="#2563eb" stroke-width="2.5" />

        <!-- Right face -->
        <polygon points="160,90 210,40 210,120 160,170" fill="rgba(37, 99, 235, 0.35)" stroke="#2563eb" stroke-width="2.5" />

        <!-- Dimension labels -->
        <text x="95" y="185" class="text-sm font-extrabold fill-blue-700 dark:fill-blue-300">a (uzunlik)</text>
        <text x="190" y="155" class="text-sm font-extrabold fill-blue-700 dark:fill-blue-300">b (en)</text>
        <text x="20" y="135" class="text-sm font-extrabold fill-blue-700 dark:fill-blue-300">c (balandlik)</text>
      </svg>
      <span class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 text-center">Hajm: \\(V = a \\cdot b \\cdot c\\), To'la sirt: \\(S = 2(ab+bc+ac)\\)</span>
    </div>
  `,

  // Fazoviy shakllar 2 (Silindr, Konus, Shar)
  roundBodies: () => `
    <div class="flex flex-col items-center justify-center p-4 bg-teal-50/50 dark:bg-teal-950/20 rounded-2xl border border-teal-100 dark:border-teal-900/40">
      <svg viewBox="0 0 320 200" class="w-full max-w-[280px] h-auto geom-svg" xmlns="http://www.w3.org/2000/svg">
        <!-- Cylinder -->
        <ellipse cx="90" cy="50" rx="40" ry="14" fill="rgba(13, 148, 136, 0.3)" stroke="#0d9488" stroke-width="2" />
        <line x1="50" y1="50" x2="50" y2="150" stroke="#0d9488" stroke-width="2" />
        <line x1="130" y1="50" x2="130" y2="150" stroke="#0d9488" stroke-width="2" />
        <path d="M 50,150 A 40,14 0 0,0 130,150" fill="none" stroke="#0d9488" stroke-width="2" />
        <path d="M 50,150 A 40,14 0 0,1 130,150" fill="none" stroke="#0d9488" stroke-width="1.5" stroke-dasharray="3,3" />
        <text x="80" y="180" class="text-xs font-bold fill-teal-700 dark:fill-teal-300">Silindr (V=πR²H)</text>

        <!-- Sphere -->
        <circle cx="230" cy="100" r="45" fill="rgba(13, 148, 136, 0.2)" stroke="#0d9488" stroke-width="2" />
        <ellipse cx="230" cy="100" rx="45" ry="12" fill="none" stroke="#0d9488" stroke-width="1.5" stroke-dasharray="3,3" />
        <text x="210" y="180" class="text-xs font-bold fill-teal-700 dark:fill-teal-300">Shar (V=4/3πR³)</text>
      </svg>
      <span class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 text-center">Aylanma fazoviy jismlar: Silindr, Konus va Shar</span>
    </div>
  `,

  // Vektorlar
  vectorDiagram: () => `
    <div class="flex flex-col items-center justify-center p-4 bg-sky-50/50 dark:bg-sky-950/20 rounded-2xl border border-sky-100 dark:border-sky-900/40">
      <svg viewBox="0 0 320 220" class="w-full max-w-[280px] h-auto geom-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#0284c7" />
          </marker>
        </defs>

        <!-- Coordinate Axes -->
        <line x1="30" y1="180" x2="290" y2="180" stroke="#94a3b8" stroke-width="1.5" />
        <line x1="50" y1="200" x2="50" y2="30" stroke="#94a3b8" stroke-width="1.5" />
        <text x="285" y="175" class="text-xs font-bold fill-slate-500">x</text>
        <text x="40" y="35" class="text-xs font-bold fill-slate-500">y</text>

        <!-- Vector a -->
        <line x1="50" y1="180" x2="220" y2="70" stroke="#0284c7" stroke-width="3" marker-end="url(#arrow)" />

        <!-- Projections -->
        <line x1="220" y1="70" x2="220" y2="180" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="4,4" />
        <line x1="50" y1="70" x2="220" y2="70" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="4,4" />

        <!-- Coordinates labels -->
        <text x="135" y="195" class="text-xs font-extrabold fill-sky-600">x koordinata</text>
        <text x="15" y="125" class="text-xs font-extrabold fill-sky-600">y</text>
        <text x="130" y="110" class="text-base font-extrabold fill-sky-700 dark:fill-sky-300">a⃗ (x, y)</text>
      </svg>
      <span class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 text-center">Vektor uzunligi: \\(|\\vec{a}| = \\sqrt{x^2 + y^2}\\)</span>
    </div>
  `
};
