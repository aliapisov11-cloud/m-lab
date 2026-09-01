# 🌟 M-LAB — Maktab Matematikasi Interaktiv Platformasi (5–11-sinf)

> **M-LAB (Maktab Laboratoriyasi)** — 5-sinfdan 11-sinfgacha bo'lgan maktab o'quvchilari uchun algebra va geometriya fanlarini eng sodda, tushunarli va hayotiy tilda o'rgatuvchi zamonaviy interaktiv platforma.

Platforma **3 ta tilda** (🇺🇿 O'zbekcha, 🇷🇺 Русский, 🇬🇧 English) 100% to'liq ishlaydi va jami **81 ta darslar bazasini** o'z ichiga oladi.

---

## 📁 Loyiha Tuzilishi (Project Structure)

```
M-LAB/
├── index.html                 # Asosiy sahifa (UI, 1-Click til tanlash, qidiruv, sinflar filtri)
├── README.md                  # Loyiha haqida to'liq qo'llanma
├── css/
│   └── styles.css             # Maxsus animatsiyalar, KaTeX moslashuvchanligi va dizayn
├── js/
│   ├── i18n.js                # Interfeys tarjimalari (UZ, RU, EN lug'ati)
│   ├── data.js                # 81 ta mavzuning to'liq ma'lumotlar bazasi (UZ, RU, EN)
│   ├── app.js                 # Asosiy dastur mantig'i, reaktiv filtrlar, mavzular renderlash
│   ├── calculators.js         # Interaktiv jonli kalkulyatorlar (Kasrlar, Pifagor, Diskriminant va h.k.)
│   └── svg-render.js          # Geometrik shakllar va vizual SVG diagrammalar
└── data/
    ├── topics.json            # 81 ta mavzuning toza JSON formatidagi to'liq bazasi
    └── add_topic_template.json# Yangi mavzular qo'shish uchun tayyor shablon
```

---

## 📚 Barcha 81 Ta Mavzular Ro'yxati

### 🎓 5-sinf (11 ta dars):
1. **Oddiy kasrlar va ularni qo'shish-ayirish** (`kasrlar-oddiy`)
2. **Aralash sonlar va Noto'g'ri kasrlar** (`kasrlar-aralash`)
3. **Burchaklar turlari (O'tkir, To'g'ri, O'tmas)** (`burchaklar-asoslari`)
4. **Natural sonlar va Qoldiqli bo'lish** (`natural-sonlar`)
5. **Perimetr va Yuza tushunchasi** (`perimetr-yuza-5`)
6. **Bo'linish alomatlari (2, 3, 5, 9, 10)** (`bolinish-alomatlari`)
7. **O'rta arifmetik (Baholar o'rtachasi)** (`orta-arifmetik`)
8. **Harakat masalalari ($S = v \cdot t$)** (`harakat-masalalari`)
9. **Ko'paytirishning taqsimot qonuni ($a(b+c) = ab+ac$)** (`taqsimot-qonuni`)
10. **Rim raqamlari (I, V, X, L, C, D, M)** (`rim-raqamlari`)
11. **To'g'ri burchakli parallelepiped va Kub hajmi ($V = a \cdot b \cdot c$)** (`parallelepiped-5`)

### 🎓 6-sinf (12 ta dars):
12. **O'nli kasrlar (Vergul bilan hisoblash)** (`onli-kasrlar`)
13. **Kasrlarni ko'paytirish va bo'lish siri** (`kasrlar-kopaytirish`)
14. **Musbat va Manfiy sonlar** (`manfiy-sonlar`)
15. **Proporsiya va Foizlar** (`proporsiya`)
16. **Oddiy tenglamalar (Tarozi pallasi)** (`chiziqli-tenglamalar-oddiy`)
17. **Aylana va Doira (Radius, Diametr, $\pi$)** (`aylana-doira`)
18. **Masshtab va Xarita** (`masshtab-xarita`)
19. **EKUB va EKUK** (`ekub-ekuk`)
20. **Koordinatalar tekisligi va Nuqtalar ($A(x; y)$)** (`koordinata-tekisligi`)
21. **Sonning moduli (Absolyut qiymat: $|x|$)** (`son-moduli`)
22. **To'g'ri va Teskari proporsionallik** (`proporsionallik-turlari`)
23. **Doiraviy diagrammalar va Foizlar ($100\% = 360^\circ$)** (`doiraviy-diagramma`)

### 🎓 7-sinf (12 ta dars):
24. **Qisqa ko'paytirish formulalari ($(a \pm b)^2, a^2 - b^2$)** (`qisqa-kopaytirish`)
25. **Darajalar va ularning xossalari** (`darajalar-xossalari`)
26. **Chiziqli funksiya ($y = kx + b$)** (`chiziqli-funksiya`)
27. **Ko'phadlar va O'xshash hadlarni ixchamlash** (`birhad-kopxad`)
28. **Qo'shni va vertikal burchaklar** (`burchaklar`)
29. **Uchburchaklar tengligi alomatlari** (`uchburchak-tengligi`)
30. **Kublar yig'indisi va ayirmasi ($a^3 \pm b^3$)** (`kublar-formulasi`)
31. **Uchburchak ichki burchaklari yig'indisi ($180^\circ$)** (`uchburchak-burchaklari-180`)
32. **Ko'phadlarni guruhlash usulida ko'paytuvchilarga ajratish** (`guruhlash-usuli`)
33. **Uchburchak medianasi, bissektrisasi va balandligi** (`mediana-bissektrisa-balandlik`)
34. **Birhadlar ustida amallar** (`birhadlar-amallar`)
35. **Parallel to'g'ri chiziqlar va Kesuvchi** (`parallel-kesuvchi`)

### 🎓 8-sinf (12 ta dars):
36. **Kvadrat tenglamalar ($D = b^2 - 4ac$)** (`kvadrat-tenglamalar`)
37. **Kvadrat ildizlar** (`kvadrat-ildizlar`)
38. **Pifagor teoremasi ($c^2 = a^2 + b^2$)** (`pifagor`)
39. **Uchburchaklar va ularning yuzasi** (`uchburchaklar`)
40. **To'rtburchaklar yuzasi (Kvadrat, To'g'ri to'rtburchak, Trapetsiya)** (`tortburchaklar`)
41. **Chiziqli tenglamalar sistemasi** (`tenglamalar-sistemasi`)
42. **Viyet teoremasi** (`viyet-teoremasi`)
43. **O'xshash uchburchaklar va Fales teoremasi** (`oxshash-uchburchaklar`)
44. **Romb va uning yuzasi ($S = \frac{d_1 d_2}{2}$)** (`romb-yuzasi`)
45. **Trapetsiyaning o'rta chizig'i ($l = \frac{a+b}{2}$)** (`trapetsiya-orta-chiziq`)
46. **Kvadrat uchhadni to'la kvadratga ajratish** (`tola-kvadrat`)
47. **Parallelogramm va uning xossalari** (`parallelogramm`)

### 🎓 9-sinf (12 ta dars):
48. **Arifmetik progressiya ($a_n, S_n$)** (`progressiyalar`)
49. **Geometrik progressiya ($b_n, S_n$)** (`geometrik-progressiya`)
50. **Trigonometriya asoslari ($\sin, \cos, \text{tg}$)** (`trigonometriya-asoslari`)
51. **Sinuslar va Kosinuslar teoremalari** (`sinuslar-kosinuslar`)
52. **Vektorlar asoslari (Uzunlik va Yo'nalish)** (`vektorlar`)
53. **Geron formulasi (3 tomon bo'yicha yuza)** (`geron-formulasi`)
54. **Kvadratik tengsizliklar (Intervallar usuli)** (`kvadratik-tengsizliklar`)
55. **Trigonometrik burchaklar jadvali** (`trig-jadval`)
56. **Cheksiz kamayuvchi geometrik progressiya ($S = \frac{b_1}{1 - q}$)** (`cheksiz-progressiya`)
57. **Burchakning Radian o'lchovi ($\pi \text{ rad} = 180^\circ$)** (`radian-olchov`)
58. **Aylanaga o'tkazilgan urinma va kesuvchi xossalari ($AK^2 = AB \cdot AC$)** (`urinma-kesuvchi`)
59. **Aylana yoyi uzunligi va Sektor yuzasi** (`aylana-sektor`)

### 🎓 10-sinf (12 ta dars):
60. **Logarifm asoslari ($\log_a b$)** (`logarifmlar`)
61. **Trig-ayniyatlar va Qo'shish formulalari** (`trig-ayniyatlar`)
62. **Ko'rsatkichli tenglamalar ($a^x = a^b$)** (`korsatkichli-tenglamalar`)
63. **Logarifmik tenglamalar va Aniqlanish sohasi** (`logarifmik-tenglamalar`)
64. **Fazoviy shakllar (Kub, Parallelepiped, Prizma)** (`fazoviy-jismlar-1`)
65. **Piramida hajmi va to'la sirti** (`piramida-hajmi`)
66. **Fazoda to'g'ri chiziqlar va tekisliklar (Ayqash chiziqlar)** (`aksonometriya`)
67. **Ko'rsatkichli tengsizliklar ($a^x > a^b$)** (`korsatkichli-tengsizliklar`)
68. **Oddiy trigonometrik tenglamalar ($\sin x = a, \cos x = a$)** (`trig-tenglamalar`)
69. **Darajali funksiyalar va ularning juft/toqligi** (`darajali-funksiya`)
70. **Fazoda tekisliklarning o'zaro joylashuvi** (`fazoda-tekisliklar`)
71. **Oddiy trigonometrik tengsizliklar ($\sin x > a, \cos x < a$)** (`trig-tengsizliklar`)

### 🎓 11-sinf (10 ta dars):
72. **Aylanma fazoviy jismlar (Silindr, Konus, Shar)** (`fazoviy-jismlar-2`)
73. **Parabola uchi va funksiya ekstremumlari** (`funksiyalar-ekstremum`)
74. **Hosila nima? (Harakat tezligi)** (`hosila-asoslari`)
75. **Boshlang'ich funksiya va Integral nima?** (`integral-yuzasi`)
76. **Murakkab funksiya hosilasi va Urinma** (`murakkab-hosila`)
77. **Kombinatorika va Ehtimollik ($P, A, C$)** (`kombinatorika-ehtimollik`)
78. **Aniq integral va Nyuton-Leybnits formulasi ($\int_a^b f(x)dx = F(b) - F(a)$)** (`nyuton-leybnits`)
79. **Hosilaning geometrik ma'nosi ($k = \text{tg}\,\alpha = f'(x_0)$)** (`hosila-geometrik-manosi`)
80. **Egri chiziqli trapetsiya yuzini hisoblash** (`egri-chiziqli-yuza`)
81. **Bog'liq bo'lmagan hodisalar ehtimoli va Ko'paytirish qoidasi ($P(A \cap B) = P(A) \cdot P(B)$)** (`mustaqil-hodisalar`)

---

## ➕ Yangi Mavzu Qo'shish Yo'riqnomasi

Kelgusida yangi mavzular qo'shish uchun:
1. `data/add_topic_template.json` shablonidagi tuzilmani oling.
2. O'zbek (`uz`), Rus (`ru`) va Ingliz (`en`) tillaridagi ma'lumotlarni to'ldiring.
3. Yangi mavzu obyektini `js/data.js` faylidagi `mathTopicsData` massivining oxiriga joylang (yoki `data/topics.json` fayliga qo'shing).
4. Sahifani yangilang — yangi mavzu avtomatik tarzda sinf filtri, qidiruv va barcha tillarda paydo bo'ladi!

---

## 💻 Texnologiyalar
- **HTML5, CSS3, Tailwind CSS** (Zamonaviy dizayn va dark mode).
- **Vanilla JavaScript (ES6+)** (Tezkor, mustaqil va reaktiv arxitektura).
- **KaTeX** (LaTeX matematik formulalarini yashin tezligida chiroyli chizish).
- **Lucide Icons** (Zamonaviy vektor ikonkalari).
