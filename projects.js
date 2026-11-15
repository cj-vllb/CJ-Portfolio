/* =====================================================================
   PORTFOLIO PROJECTS  (the single source of truth for "My Portfolio")
   ---------------------------------------------------------------------
   TO ADD A PROJECT:
     1. Copy one of the { ... } blocks below.
     2. Paste it inside the right section (same category group).
     3. Change title, category, description, image and link. Save.

   - "category" must be exactly one of the ids in PORTFOLIO_CATEGORIES.
   - The "All" tab shows projects in the same order as this list.
   - The image file goes in the same folder as index.html.
   ===================================================================== */

// The filter tabs. "all" is special: it shows every project.
// Add or rename tabs here; the buttons are built from this list.
const PORTFOLIO_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'web-mobile-apps', label: 'Web & Mobile Apps' },
  { id: 'websites-landing-pages', label: 'Websites & Landing Pages' },
];

const PORTFOLIO_PROJECTS = [
  // ===================================
  // WEB & MOBILE APPS
  // ===================================
  {
    title: 'TrackMyKita',
    category: 'web-mobile-apps',
    description: 'TrackMyKita is a personal finance tracker. Record income and expenses, set monthly budgets and see where your money goes.',
    image: 'kita-thumbnail.png',
    imageAlt: 'TrackMyKita preview',
    link: 'https://trackmykita.online',
  },

  // ===================================
  // WEBSITES & LANDING PAGES
  // ===================================
  {
    title: 'Apex Physique',
    category: 'websites-landing-pages',
    description: 'Apex Physique is a conversion-focused landing page for a fat-loss coaching program for busy professionals with two-step application and booking flow.',
    image: 'apex-thumbnail.png',
    imageAlt: 'Apex Physique website preview',
    link: 'https://cj-vllb.github.io/Apex-Physique/',
  },
  {
    title: 'Apiola',
    category: 'websites-landing-pages',
    description: 'Apiola is an interactive website featuring a unique scrolling experience that transforms navigation into an engaging and immersive journey.',
    image: 'apiola-thumbnail.png',
    imageAlt: 'Apiola website preview',
    link: 'https://cj-vllb.github.io/Apiola/',
  },
];
