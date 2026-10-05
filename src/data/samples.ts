// Helper to create crisp, high-contrast SVG images of homework problems
function createProblemSvg(
  subject: string,
  badgeText: string,
  problemText: string,
  subText: string,
  extraGraphicSvg: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="480" viewBox="0 0 800 480">
    <defs>
      <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f8fafc"/>
      </linearGradient>
      <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#4f46e5"/>
        <stop offset="100%" stop-color="#7c3aed"/>
      </linearGradient>
      <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e2e8f0" stroke-width="0.75"/>
      </pattern>
    </defs>
    <!-- Background Notebook Paper Style -->
    <rect width="800" height="480" rx="16" fill="url(#cardBg)" stroke="#cbd5e1" stroke-width="2"/>
    <rect width="800" height="480" rx="16" fill="url(#grid)" opacity="0.6"/>
    
    <!-- Top banner -->
    <rect x="0" y="0" width="800" height="60" rx="16" fill="url(#headerGrad)"/>
    <rect x="0" y="30" width="800" height="30" fill="url(#headerGrad)"/>
    <text x="32" y="38" font-family="Arial, sans-serif" font-weight="bold" font-size="20" fill="#ffffff">📘 ${subject}</text>
    <rect x="660" y="16" width="105" height="28" rx="14" fill="#ffffff" fill-opacity="0.2"/>
    <text x="712" y="35" font-family="Arial, sans-serif" font-weight="600" font-size="13" fill="#ffffff" text-anchor="middle">${badgeText}</text>
    
    <!-- Content Box -->
    <rect x="32" y="80" width="736" height="368" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
    
    <!-- Problem Content -->
    <text x="56" y="125" font-family="Arial, sans-serif" font-weight="bold" font-size="22" fill="#1e293b">${problemText}</text>
    <text x="56" y="165" font-family="Arial, sans-serif" font-size="16" fill="#475569">${subText}</text>

    ${extraGraphicSvg}

    <rect x="56" y="395" width="688" height="36" rx="8" fill="#f1f5f9"/>
    <text x="72" y="418" font-family="Arial, sans-serif" font-size="13" fill="#64748b">Topshiriq: Savolni to'liq o'qing, yechim formulalarini ko'rsatib, javobni aniqlang.</text>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export interface SampleProblem {
  id: string;
  subject: string;
  title: string;
  badge: string;
  imageUrl: string;
  description: string;
}

export const SAMPLE_PROBLEMS: SampleProblem[] = [
  {
    id: 'math-algebra',
    subject: 'Matematika',
    title: 'Kvadrat tenglama',
    badge: '9-sinf Algebra',
    description: '2x² - 5x + 2 = 0 tenglamasini yeching va ildizlarini toping.',
    imageUrl: createProblemSvg(
      'Matematika (Algebra)',
      '№ 142-mashq',
      '142-masala. Tenglamani yeching:',
      'Kvadrat tenglamaning diskriminantini toping va ildizlarini hisoblang:',
      `<rect x="56" y="195" width="380" height="90" rx="8" fill="#eef2ff" stroke="#c7d2fe" stroke-width="2"/>
       <text x="80" y="252" font-family="Courier, monospace" font-weight="bold" font-size="32" fill="#3730a3">2x² - 5x + 2 = 0</text>
       <text x="56" y="325" font-family="Arial, sans-serif" font-size="16" fill="#1e293b">Savollar:</text>
       <text x="76" y="352" font-family="Arial, sans-serif" font-size="15" fill="#475569">1) D = b² - 4ac diskriminant qiymatini toping.</text>
       <text x="76" y="375" font-family="Arial, sans-serif" font-size="15" fill="#475569">2) x₁ va x₂ ildizlarini aniqlang.</text>`
    ),
  },
  {
    id: 'geometry-pythagoras',
    subject: 'Geometriya',
    title: 'Pifagor teoremasi',
    badge: '8-sinf Geometriya',
    description: "Katetlari 6 sm va 8 sm bo'lgan to'g'ri burchakli uchburchak gipotenuzasi va yuzi.",
    imageUrl: createProblemSvg(
      'Geometriya',
      '№ 88-masala',
      "To'g'ri burchakli uchburchak:",
      "ABC to'g'ri burchakli uchburchakda (∠C = 90°), a = 6 sm, b = 8 sm bo'lsa:",
      `<polygon points="120,340 120,200 360,340" fill="#f0fdf4" stroke="#16a34a" stroke-width="3"/>
       <rect x="120" y="320" width="20" height="20" fill="none" stroke="#16a34a" stroke-width="2"/>
       <text x="90" y="275" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#15803d">a = 6 sm</text>
       <text x="210" y="370" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#15803d">b = 8 sm</text>
       <text x="250" y="260" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="#b91c1c">c = ?</text>
       <text x="430" y="230" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="#1e293b">Topshiriq:</text>
       <text x="430" y="265" font-family="Arial, sans-serif" font-size="16" fill="#334155">a) Uchburchak gipotenuzasi (c) ni toping.</text>
       <text x="430" y="295" font-family="Arial, sans-serif" font-size="16" fill="#334155">b) Uchburchak yuzi (S) ni hisoblang.</text>`
    ),
  },
  {
    id: 'physics-dynamics',
    subject: 'Fizika',
    title: "Nyutonning 2-qonuni",
    badge: '7-sinf Fizika',
    description: "Jism massasi m = 5 kg, ta'sir qiluvchi kuch F = 20 N. Tezlanish va masofani toping.",
    imageUrl: createProblemSvg(
      'Fizika (Mexanika)',
      '№ 4-masala',
      "Harakat va dinamika qonunlari:",
      "Massasi m = 5 kg bo'lgan tinch turgan jismga F = 20 N gorizontal kuch ta'sir qilmoqda.",
      `<rect x="80" y="240" width="120" height="70" rx="6" fill="#e0f2fe" stroke="#0284c7" stroke-width="3"/>
       <line x1="200" y1="275" x2="310" y2="275" stroke="#dc2626" stroke-width="4"/>
       <polygon points="310,270 325,275 310,280" fill="#dc2626"/>
       <text x="220" y="265" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#dc2626">F = 20 N</text>
       <text x="115" y="280" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#0369a1">m = 5 kg</text>
       <line x1="50" y1="312" x2="400" y2="312" stroke="#64748b" stroke-width="3"/>
       <text x="420" y="230" font-family="Arial, sans-serif" font-weight="bold" font-size="18" fill="#1e293b">Savollar:</text>
       <text x="420" y="265" font-family="Arial, sans-serif" font-size="16" fill="#334155">1) Jismning tezlanishini (a) toping.</text>
       <text x="420" y="295" font-family="Arial, sans-serif" font-size="16" fill="#334155">2) Dastlabki t = 4 sekundda o'tgan yo'li (S)?</text>`
    ),
  },
  {
    id: 'english-test',
    subject: 'Ingliz tili',
    title: 'Test savoli (Grammar)',
    badge: 'DTM / CEFR Test',
    description: 'Present Perfect tense: She ___ in London for five years.',
    imageUrl: createProblemSvg(
      'English Language',
      'Question 19',
      'Choose the correct answer to complete the sentence:',
      'Grammar Test: Tenses & Time Expressions',
      `<rect x="56" y="200" width="688" height="50" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
       <text x="76" y="232" font-family="Arial, sans-serif" font-weight="600" font-size="18" fill="#0f172a">"She ________ in Tashkent since 2018."</text>
       <rect x="76" y="270" width="300" height="38" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
       <text x="96" y="295" font-family="Arial, sans-serif" font-weight="600" font-size="15" fill="#334155">A) lived</text>
       <rect x="400" y="270" width="300" height="38" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
       <text x="420" y="295" font-family="Arial, sans-serif" font-weight="600" font-size="15" fill="#334155">B) has lived</text>
       <rect x="76" y="320" width="300" height="38" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
       <text x="96" y="345" font-family="Arial, sans-serif" font-weight="600" font-size="15" fill="#334155">C) is living</text>
       <rect x="400" y="320" width="300" height="38" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
       <text x="420" y="345" font-family="Arial, sans-serif" font-weight="600" font-size="15" fill="#334155">D) lives</text>`
    ),
  },
  {
    id: 'chemistry-equation',
    subject: 'Kimyo',
    title: 'Reaksiyani tenglashtirish',
    badge: '8-sinf Kimyo',
    description: "Al + O₂ → Al₂O₃ kimyoviy reaksiyasini tenglashtiring va koeffitsiyentlar yig'indisini toping.",
    imageUrl: createProblemSvg(
      'Kimyo',
      '№ 27-mashq',
      'Kimyoviy reaksiyani tenglashtiring:',
      "Alyuminiyning kislorodda yonish reaksiyasi tenglamasi:",
      `<rect x="56" y="195" width="480" height="85" rx="8" fill="#fff7ed" stroke="#fed7aa" stroke-width="2"/>
       <text x="80" y="250" font-family="Courier, monospace" font-weight="bold" font-size="30" fill="#c2410c">_ Al + _ O₂ → _ Al₂O₃</text>
       <text x="56" y="320" font-family="Arial, sans-serif" font-size="16" fill="#1e293b">Savollar:</text>
       <text x="76" y="345" font-family="Arial, sans-serif" font-size="15" fill="#475569">1) Stexiometrik koeffitsiyentlarni to'g'ri joylashtiring.</text>
       <text x="76" y="370" font-family="Arial, sans-serif" font-size="15" fill="#475569">2) Reaksiyadagi barcha koeffitsiyentlar yig'indisi nechaga teng?</text>`
    ),
  },
];
