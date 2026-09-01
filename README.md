# 🌟 M-LAB — Maktab Matematikasi Interaktiv Platformasi (5–11-sinf)

> **M-LAB (Maktab Laboratoriyasi)** — 5-sinfdan 11-sinfgacha bo'lgan maktab o'quvchilari uchun algebra va geometriya fanlarini eng sodda, tushunarli va hayotiy tilda o'rgatuvchi zamonaviy interaktiv platforma.

Platforma **3 ta tilda** (🇺🇿 O'zbekcha, 🇷🇺 Русский, 🇬🇧 English) 100% to'liq ishlaydi, jami **100 ta to'liq darslar bazasini** va har bir mavzu bo'yicha **3 xil qiyinlikdagi misol turlarini** (Oddiy, O'rtacha, Qiyin) o'z ichiga oladi.

---

## 🚀 Yangi Imkoniyat: Misollarning Turli Ko'rinishlari (3 Ta Qiyinlik Darajasi)
Har bir mavzuda bitta misol bilan cheklanib qolmay, uning turli ko'rinishlari berilgan:
- 🟢 **1-tur: Oddiy / Asosiy misol (Basic)** — Formulani yangi o'rganuvchilar uchun to'g'ridan-to'g'ri amaliy misol.
- 🟡 **2-tur: O'rtacha / Boshqacha ko'rinish (Intermediate)** — Qavslar, manfiy sonlar yoki kasrlar aralashgan amaliy misol.
- 🔴 **3-tur: Qiyinroq / Imtihon darajasi (Advanced / Exam level)** — Bir nechta teoremalarni birlashtiruvchi, mantiqiy murakkab misol.
Har bir turning **"Nega bunday qilindi"**, **"Qanday hisoblandi"** va **"Eslatma"** bosqichma-bosqich yechilishi mavjud!

---

## 📁 Loyiha Tuzilishi (Project Structure)

```
M-LAB/
├── index.html                 # Asosiy sahifa (UI, 1-Click til tanlash, qidiruv, sinflar filtri)
├── README.md                  # Loyiha haqida to'liq qo'llanma
├── css/
│   └── styles.css             # Maxsus animatsiyalar, KaTeX moslashuvchanligi va dizayn
├── js/
│   ├── i18n.js                # Interfeys tarjimalari (UZ, RU, EN lug'ati va darajalar)
│   ├── data.js                # 100 ta mavzuning to'liq ma'lumotlar bazasi (UZ, RU, EN)
│   ├── app.js                 # Asosiy dastur mantig'i, misol darajalari tablari, reaktiv filtrlar
│   ├── calculators.js         # Interaktiv jonli kalkulyatorlar (Kasrlar, Pifagor, Diskriminant va h.k.)
│   └── svg-render.js          # Geometrik shakllar va vizual SVG diagrammalar
└── data/
    ├── topics.json            # 100 ta mavzuning toza JSON formatidagi to'liq bazasi
    └── add_topic_template.json# Yangi mavzular qo'shish uchun tayyor shablon
```

---

## 📚 Barcha 100 Ta Mavzular Ro'yxati (5–11-sinflar)

### 🎓 5-sinf (14 ta dars):
1. **Oddiy kasrlar va ularni qo'shish-ayirish**
2. **Aralash sonlar va Noto'g'ri kasrlar**
3. **Burchaklar turlari (O'tkir, To'g'ri, O'tmas)**
4. **Natural sonlar va Qoldiqli bo'lish**
5. **Perimetr va Yuza tushunchasi**
6. **Bo'linish alomatlari (2, 3, 5, 9, 10)**
7. **O'rta arifmetik (Baholar o'rtachasi)**
8. **Harakat masalalari ($S = v \cdot t$)**
9. **Ko'paytirishning taqsimot qonuni ($a(b+c) = ab+ac$)**
10. **Rim raqamlari (I, V, X, L, C, D, M)**
11. **To'g'ri burchakli parallelepiped va Kub hajmi ($V = a \cdot b \cdot c$)**
12. **Amallar tartibi va Qavslar bilan hisoblash**
13. **Sonlar ketma-ketligi va Qonuniyatlar**
14. **Vaqt o'lchov birliklari (Soat, Daqiqa, Sekund)**

### 🎓 6-sinf (15 ta dars):
15. **O'nli kasrlar (Vergul bilan hisoblash)**
16. **Kasrlarni ko'paytirish va bo'lish siri**
17. **Musbat va Manfiy sonlar**
18. **Proporsiya va Foizlar**
19. **Oddiy tenglamalar (Tarozi pallasi)**
20. **Aylana va Doira (Radius, Diametr, $\pi$)**
21. **Masshtab va Xarita**
22. **EKUB va EKUK**
23. **Koordinatalar tekisligi va Nuqtalar ($A(x; y)$)**
24. **Sonning moduli (Absolyut qiymat: $|x|$)**
25. **To'g'ri va Teskari proporsionallik**
26. **Doiraviy diagrammalar va Foizlar ($100\% = 360^\circ$)**
27. **Manfiy sonlarni ko'paytirish va bo'lish**
28. **Tenglamalar tuzish orqali matnli masalalar yechish**
29. **Statistika asoslari: O'rta qiymat, Moda va Mediana**

### 🎓 7-sinf (15 ta dars):
30. **Qisqa ko'paytirish formulalari ($(a \pm b)^2, a^2 - b^2$)**
31. **Darajalar va ularning xossalari**
32. **Chiziqli funksiya ($y = kx + b$)**
33. **Ko'phadlar va O'xshash hadlarni ixchamlash**
34. **Qo'shni va vertikal burchaklar**
35. **Uchburchaklar tengligi alomatlari**
36. **Kublar yig'indisi va ayirmasi ($a^3 \pm b^3$)**
37. **Uchburchak ichki burchaklari yig'indisi ($180^\circ$)**
38. **Ko'phadlarni guruhlash usulida ko'paytuvchilarga ajratish**
39. **Uchburchak medianasi, bissektrisasi va balandligi**
40. **Birhadlar ustida amallar**
41. **Parallel to'g'ri chiziqlar va Kesuvchi**
42. **Tenglamalar sistemasini algebraik qo'shish usulida yechish**
43. **Ko'phadni birhadga bo'lish qoidasi**
44. **Uchburchak tengsizligi ($a < b + c$)**

### 🎓 8-sinf (15 ta dars):
45. **Kvadrat tenglamalar ($D = b^2 - 4ac$)**
46. **Kvadrat ildizlar**
47. **Pifagor teoremasi ($c^2 = a^2 + b^2$)**
48. **Uchburchaklar va ularning yuzasi**
49. **To'rtburchaklar yuzasi (Kvadrat, To'g'ri to'rtburchak, Trapetsiya)**
50. **Chiziqli tenglamalar sistemasi**
51. **Viyet teoremasi**
52. **O'xshash uchburchaklar va Fales teoremasi**
53. **Romb va uning yuzasi ($S = \frac{d_1 d_2}{2}$)**
54. **Trapetsiyaning o'rta chizig'i ($l = \frac{a+b}{2}$)**
55. **Kvadrat uchhadni to'la kvadratga ajratish**
56. **Parallelogramm va uning xossalari**
57. **Algebraik (Ratsional) kasrlarni soddalashtirish va qisqartirish**
58. **Keltirilgan kvadrat tenglamalar ($x^2 + px + q = 0$)**
59. **Trapetsiya va Ko'pburchaklar yuzasini hisoblash usullari**

### 🎓 9-sinf (15 ta dars):
60. **Arifmetik progressiya ($a_n, S_n$)**
61. **Geometrik progressiya ($b_n, S_n$)**
62. **Trigonometriya asoslari ($\sin, \cos, \text{tg}$)**
63. **Sinuslar va Kosinuslar teoremalari**
64. **Vektorlar asoslari (Uzunlik va Yo'nalish)**
65. **Geron formulasi (3 tomon bo'yicha yuza)**
66. **Kvadratik tengsizliklar (Intervallar usuli)**
67. **Trigonometrik burchaklar jadvali**
68. **Cheksiz kamayuvchi geometrik progressiya ($S = \frac{b_1}{1 - q}$)**
69. **Burchakning Radian o'lchovi ($\pi \text{ rad} = 180^\circ$)**
70. **Aylanaga o'tkazilgan urinma va kesuvchi xossalari ($AK^2 = AB \cdot AC$)**
71. **Aylana yoyi uzunligi va Sektor yuzasi**
72. **Vektorlarning skalyar ko'paytmasi ($\vec{a}\cdot\vec{b} = |\vec{a}||\vec{b}|\cos\alpha$)**
73. **Ikkinchi darajali tenglamalar sistemasi**
74. **Davriy o'nli kasrlarni oddiy kasrga aylantirish**

### 🎓 10-sinf (15 ta dars):
75. **Logarifm asoslari ($\log_a b$)**
76. **Trig-ayniyatlar va Qo'shish formulalari**
77. **Ko'rsatkichli tenglamalar ($a^x = a^b$)**
78. **Logarifmik tenglamalar va Aniqlanish sohasi**
79. **Fazoviy shakllar (Kub, Parallelepiped, Prizma)**
80. **Piramida hajmi va to'la sirti**
81. **Fazoda to'g'ri chiziqlar va tekisliklar (Ayqash chiziqlar)**
82. **Ko'rsatkichli tengsizliklar ($a^x > a^b$)**
83. **Oddiy trigonometrik tenglamalar ($\sin x = a, \cos x = a$)**
84. **Darajali funksiyalar va ularning juft/toqligi**
85. **Fazoda tekisliklarning o'zaro joylashuvi**
86. **Oddiy trigonometrik tengsizliklar ($\sin x > a, \cos x < a$)**
87. **Logarifmik tengsizliklar va Asosning 1 dan kichik bo'lish qoidasi**
88. **Trigonometrik ayniyatlarni isbotlash usullari**
89. **Fazoda ikki tekislik orasidagi burchak (Ikki yoqli burchak)**

### 🎓 11-sinf (11 ta dars):
90. **Aylanma fazoviy jismlar (Silindr, Konus, Shar)**
91. **Parabola uchi va funksiya ekstremumlari**
92. **Hosila nima? (Harakat tezligi)**
93. **Boshlang'ich funksiya va Integral nima?**
94. **Murakkab funksiya hosilasi va Urinma**
95. **Kombinatorika va Ehtimollik ($P, A, C$)**
96. **Aniq integral va Nyuton-Leybnits formulasi ($\int_a^b f(x)dx = F(b) - F(a)$)**
97. **Hosilaning geometrik ma'nosi ($k = \text{tg}\,\alpha = f'(x_0)$)**
98. **Egri chiziqli trapetsiya yuzini hisoblash**
99. **Bog'liq bo'lmagan hodisalar ehtimoli va Ko'paytirish qoidasi ($P(A \cap B) = P(A) \cdot P(B)$)**
100. **Funksiyaning o'sish va kamayish oraliqlarini hosila yordamida topish**

---

## 💻 Texnologiyalar
- **HTML5, CSS3, Tailwind CSS** (Zamonaviy dizayn va dark mode).
- **Vanilla JavaScript (ES6+)** (Tezkor, mustaqil va reaktiv arxitektura).
- **KaTeX** (LaTeX matematik formulalarini yashin tezligida chiroyli chizish).
- **Lucide Icons** (Zamonaviy vektor ikonkalari).
