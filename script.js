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

  /* ----------------------------------------------------------
     SCROLL REVEAL — Intersection Observer
  ---------------------------------------------------------- */
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
        threshold: 0.15,                 // trigger once 15% of the element is visible
        rootMargin: '0px 0px -60px 0px', // reveal slightly before it's fully in view
      }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ----------------------------------------------------------
     HEADER ELEVATION ON SCROLL
     Adds/removes ".scrolled" on the header so it gains a solid
     background + soft shadow once the page has been scrolled,
     and goes back to transparent at the very top.
  ---------------------------------------------------------- */
  const header = document.getElementById('siteHeader');
  if (header) {
    const toggleHeaderState = () => {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    toggleHeaderState();
    window.addEventListener('scroll', toggleHeaderState, { passive: true });

    /* --------------------------------------------------------
       FIXED HEADER SPACER
       The header is now `position: fixed` (see the navbar fix in
       style.css) so it's pulled out of normal document flow and no
       longer pushes the page content down on its own. To stop the
       hero section from sliding underneath it, we measure the
       header's real rendered height and apply it as top padding on
       <body>. This is re-measured on load and on resize, since the
       header's height can change (e.g. the nav pill wrapping on
       smaller screens), keeping the spacing accurate at any
       viewport size without hardcoding a pixel value in the CSS.
    ---------------------------------------------------------- */
    const syncHeaderSpacer = () => {
      document.body.style.paddingTop = `${header.offsetHeight}px`;
    };
    syncHeaderSpacer();
    window.addEventListener('resize', syncHeaderSpacer);
    // Fonts loading in can shift the header's height after first paint.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncHeaderSpacer);
    }
  }

  /* ----------------------------------------------------------
     START A PROJECT MODAL
     The "Start a Project" button in the hero triggers a modal
     containing a dedicated copy of the contact form. All fields
     use unique IDs prefixed with "modal-" to avoid any collision
     with the main contact form in the footer/contact section.

     The overlay uses CSS opacity + visibility transitions for a
     smooth fade, and the inner card slides up on open. Closing
     is possible via:
       - The "✕" close button
       - Clicking the dark backdrop outside the card
       - Pressing the Escape key
  ---------------------------------------------------------- */
  const modalOverlay = document.getElementById('projectModal');
  const openModalBtn = document.getElementById('openProjectModal');
  const closeModalBtn = document.getElementById('closeProjectModal');

  if (modalOverlay && openModalBtn && closeModalBtn) {

    const openModal = () => {
      modalOverlay.removeAttribute('hidden');
      // Small rAF delay ensures the browser has painted the element
      // before we toggle the class, guaranteeing the CSS transition fires.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          modalOverlay.classList.add('is-open');
          document.body.style.overflow = 'hidden'; // prevent background scroll
          closeModalBtn.focus();
        });
      });
    };

    const closeModal = () => {
      modalOverlay.classList.remove('is-open');
      document.body.style.overflow = '';
      // Wait for the fade-out transition to finish before hiding
      modalOverlay.addEventListener(
        'transitionend',
        () => {
          // Only re-hide if the modal is truly closed (not mid-reopen)
          if (!modalOverlay.classList.contains('is-open')) {
            modalOverlay.setAttribute('hidden', '');
          }
        },
        { once: true }
      );
      openModalBtn.focus(); // return focus to the trigger
    };

    openModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);

    // Close when clicking the dark backdrop (but not the card itself)
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('is-open')) {
        closeModal();
      }
    });

    // Handle the modal form submission (placeholder — wire to your own
    // backend or form service as needed)
    const modalForm = document.getElementById('modalContactForm');
    if (modalForm) {
      modalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // TODO: replace with your actual form submission logic
        console.log('Modal form submitted — wire up your backend here.');
        closeModal();
      });
    }
  }

  /* ----------------------------------------------------------
     FAQ ACCORDION — smooth CSS grid-template-rows animation
     The HTML uses a plain <button> + <div> pattern instead of
     <details>/<summary> so we can fully control the animation.
     Toggling ".is-open" on the .faq-item drives the CSS
     transition on grid-template-rows (0fr → 1fr) for a
     perfectly fluid, height-agnostic open/close that never
     snaps or jumps — no max-height guessing required.
  ---------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-question');
    const toggle = item.querySelector('.faq-toggle');
    if (!btn || !toggle) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Optional: close all others for a single-open accordion.
      // Remove the block below if you want multiple items open at once.
      faqItems.forEach((other) => {
        if (other !== item && other.classList.contains('is-open')) {
          other.classList.remove('is-open');
          const otherBtn = other.querySelector('.faq-question');
          const otherToggle = other.querySelector('.faq-toggle');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherToggle) otherToggle.textContent = '+';
        }
      });

      // Toggle the clicked item
      item.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      toggle.textContent = isOpen ? '+' : '−';
    });
  });

  /* ----------------------------------------------------------
     PORTFOLIO CATEGORY FILTER
     The portfolio grid is tagged by category via [data-category]
     on each ".portfolio-card". AI Agent cards are no longer in
     this grid — they live in their own sub-section below.

     Clicking a filter pill fades/scales out non-matching cards
     via ".is-hidden", then removes them from the flow with
     display:none after the CSS transition completes (so the
     grid reflows cleanly without leaving empty gaps).
  ---------------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');
  const portfolioGrid = document.getElementById('portfolioGrid');

  if (filterBtns.length && portfolioCards.length) {

    // Must match the opacity/transform transition duration on
    // .portfolio-card in style.css so the fade-out finishes before
    // we swap the DOM state and fade the new set in.
    const TRANSITION_MS = 350;

    /* --------------------------------------------------------
       applyFilter(filter, instant)
       ----------------------------------------------------------
       Runs in two clean, non-overlapping phases so cards never
       render out of sync:

       Phase 1 (skipped when `instant`): every currently-visible
       card fades out together by adding ".is-hidden" to ALL
       cards at once — old items close as one unified group
       instead of drifting out individually.

       Phase 2 (after the fade-out transition finishes): the
       layout is updated in a single synchronous block — grid
       view toggled, non-matching cards pulled from the flow with
       display:none, matching cards restored to display:'' — then
       we force a reflow before removing ".is-hidden" from just
       the matching cards, so they fade/scale in simultaneously
       against the *already-updated* grid instead of animating
       into a layout that's still shifting under them.
    -------------------------------------------------------- */
    const applyFilter = (filter, instant = false) => {
      const commit = () => {
        // The Email Marketing category gets its own 5-across grid
        // layout (see ".portfolio-grid.is-email-view" in style.css);
        // every other category keeps the standard 3-column layout.
        if (portfolioGrid) {
          portfolioGrid.classList.toggle('is-email-view', filter === 'email');
        }

        portfolioCards.forEach((card) => {
          const matches = card.dataset.category === filter;
          card.style.display = matches ? '' : 'none';
        });

        // Force a synchronous reflow so the grid has fully settled
        // into its new shape before we start the fade-in — this is
        // what prevents the "overlap / layout jump" bug where cards
        // animated in while the grid was still reflowing.
        if (portfolioGrid) {
          void portfolioGrid.offsetWidth;
        }

        portfolioCards.forEach((card) => {
          card.classList.toggle('is-hidden', card.dataset.category !== filter);
        });
      };

      if (instant) {
        commit();
        return;
      }

      // Phase 1: fade every card out together, as one group.
      portfolioCards.forEach((card) => card.classList.add('is-hidden'));
      window.setTimeout(commit, TRANSITION_MS);
    };

    // Apply the filter that matches whichever button is pre-marked
    // active — instantly, with no fade-out, since nothing has been
    // shown to the user yet.
    const activeBtn = document.querySelector('.filter-btn.is-active');
    if (activeBtn) {
      applyFilter(activeBtn.dataset.filter, true);
    }

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('is-active')) return;
        filterBtns.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        applyFilter(btn.dataset.filter);
      });
    });
  }

  /* ----------------------------------------------------------
     BACK TO TOP — smooth native scroll
     Uses the native window.scrollTo with behavior:'smooth' for
     a clean, dependency-free scroll to the top of the page.
  ---------------------------------------------------------- */
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

});
