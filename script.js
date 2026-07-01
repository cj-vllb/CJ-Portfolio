/* ============================================================
   SCROLL-REVEAL ANIMATIONS — Intersection Observer
   ------------------------------------------------------------
   This is the core animation engine for the page. It finds every
   element marked with the ".reveal" class (added throughout
   index.html — service cards, portfolio cards, section headers,
   stats, FAQ items, footer columns, etc.) and watches each one
   with an IntersectionObserver.

   When an element scrolls into view, we add ".is-visible" to it.
   The actual fade-in + slide-up animation itself lives in CSS
   (see the "SCROLL REVEAL ANIMATIONS" block in style.css) — this
   script's only job is to flip the class at the right time.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const revealEls = document.querySelectorAll('.reveal');

  // Respect users who prefer reduced motion: reveal everything
  // immediately instead of animating it in.
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Animate once, then stop watching — keeps things light.
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,           // trigger once 15% of the element is visible
        rootMargin: '0px 0px -60px 0px', // reveal slightly before it's fully in view
      }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ----------------------------------------------------------
     MODERN TOUCH #1 — Header elevation on scroll
     Adds/removes ".scrolled" on the header so it gains a solid
     background + soft shadow once the page has been scrolled,
     and goes back to transparent at the very top. Pure polish,
     does not affect layout.
  ---------------------------------------------------------- */
  const header = document.getElementById('siteHeader');
  if (header) {
    const toggleHeaderState = () => {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    toggleHeaderState();
    window.addEventListener('scroll', toggleHeaderState, { passive: true });
  }

  /* ----------------------------------------------------------
     MODERN TOUCH #2 — FAQ accordion icon (+ / −)
     The <details>/<summary> markup already handles expanding
     and collapsing natively (no JS required for that). This
     just keeps the little "+" / "−" icon in sync with the
     open/closed state for a nicer, more app-like feel.
  ---------------------------------------------------------- */
  document.querySelectorAll('.faq-item').forEach((item) => {
    const toggleIcon = item.querySelector('.faq-toggle');
    if (!toggleIcon) return;
    item.addEventListener('toggle', () => {
      toggleIcon.textContent = item.open ? '−' : '+';
    });
  });

  /* ----------------------------------------------------------
     MODERN TOUCH #3 — Portfolio category filter
     The 13-item portfolio grid is tagged by category via the
     [data-category] attribute on each ".portfolio-card". Clicking
     a filter pill toggles the active state and fades/scales out
     any card whose category doesn't match, then collapses it out
     of the grid flow once the transition finishes (so the layout
     reflows cleanly instead of leaving empty gaps).
  ---------------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  if (filterBtns.length && portfolioCards.length) {
    const applyFilter = (filter) => {
      portfolioCards.forEach((card) => {
        // Removed the 'all' condition so it strictly matches the category
        const matches = card.dataset.category === filter;
        if (matches) {
          card.style.display = '';
          requestAnimationFrame(() => card.classList.remove('is-hidden'));
        } else {
          card.classList.add('is-hidden');
          window.setTimeout(() => {
            if (card.classList.contains('is-hidden')) {
              card.style.display = 'none';
            }
          }, 350);
        }
      });
    };

    // Set initial filter based on the button that has 'is-active'
    const activeBtn = document.querySelector('.filter-btn.is-active');
    if (activeBtn) {
      applyFilter(activeBtn.dataset.filter);
    }

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        applyFilter(btn.dataset.filter);
      });
    });
  }
});
