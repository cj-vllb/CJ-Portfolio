/* ============================================================
   SCROLL-REVEAL — IntersectionObserver
   Every ".reveal" element fades/rises into place once, the first
   time it enters the viewport. Respects prefers-reduced-motion.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     THEME TOGGLE — light/dark, persisted to localStorage.
     The initial theme is already applied by a tiny inline
     script in <head> (before first paint) to avoid a flash;
     this just wires up the button and keeps it in sync.
  ---------------------------------------------------------- */
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const root = document.documentElement;

    const setLabel = (theme) => {
      themeToggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    };
    setLabel(root.getAttribute('data-theme') || 'light');

    themeToggle.addEventListener('click', () => {
      const isDark = root.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      setLabel(next);
    });
  }

  const revealEls = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ----------------------------------------------------------
     HEADER ELEVATION ON SCROLL
     Watches a 1px sentinel pinned to the top of the page instead
     of a scroll listener, so the header only updates once per
     boundary crossing rather than on every scroll frame.
  ---------------------------------------------------------- */
  const header = document.getElementById('siteHeader');
  const scrollSentinel = document.getElementById('scrollSentinel');
  if (header && scrollSentinel && 'IntersectionObserver' in window) {
    const headerScrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          header.classList.toggle('scrolled', !entry.isIntersecting);
        });
      },
      { threshold: 0 }
    );
    headerScrollObserver.observe(scrollSentinel);
  }

  /* ----------------------------------------------------------
     START A PROJECT MODAL
  ---------------------------------------------------------- */
  const modalOverlay = document.getElementById('projectModal');
  const openModalBtn = document.getElementById('openProjectModal');
  const closeModalBtn = document.getElementById('closeProjectModal');
  const modalTriggers = [openModalBtn, document.getElementById('openProjectModalNav')].filter(Boolean);
  let lastTrigger = openModalBtn;

  if (modalOverlay && openModalBtn && closeModalBtn) {

    const openModal = (e) => {
      if (e && e.currentTarget) lastTrigger = e.currentTarget;
      modalOverlay.removeAttribute('hidden');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          modalOverlay.classList.add('is-open');
          closeModalBtn.focus();
        });
      });
    };

    const closeModal = () => {
      modalOverlay.classList.remove('is-open');
      modalOverlay.addEventListener(
        'transitionend',
        () => {
          if (!modalOverlay.classList.contains('is-open')) {
            modalOverlay.setAttribute('hidden', '');
          }
        },
        { once: true }
      );
      if (lastTrigger) lastTrigger.focus();
    };

    modalTriggers.forEach((btn) => btn.addEventListener('click', openModal));
    closeModalBtn.addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('is-open')) {
        closeModal();
      }
    });

    const modalForm = document.getElementById('modalContactForm');
    if (modalForm) {
      modalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // TODO: wire up to your actual form backend.
        console.log('Modal form submitted — wire up your backend here.');
        closeModal();
      });
    }
  }

  /* ----------------------------------------------------------
     HERO YOUTUBE PLAY TRIGGER — click-to-inject iframe
     No iframe exists until the visitor actually presses play.
  ---------------------------------------------------------- */
  const heroPlayBtn = document.getElementById('heroPlayBtn');
  const heroVideoWrapper = document.getElementById('heroVideoWrapper');
  const heroVideoPlaceholder = document.getElementById('heroVideoPlaceholder');

  if (heroPlayBtn && heroVideoWrapper) {
    heroPlayBtn.addEventListener('click', () => {
      const videoId = heroVideoWrapper.dataset.videoId;

      if (!heroVideoWrapper.querySelector('iframe') && videoId) {
        const iframe = document.createElement('iframe');
        iframe.id = 'heroVideoFrame';
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`;
        iframe.title = 'Featured project video';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute(
          'allow',
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        );
        iframe.allowFullscreen = true;

        heroVideoWrapper.insertBefore(iframe, heroPlayBtn);
        if (heroVideoPlaceholder) heroVideoPlaceholder.remove();
      }

      heroPlayBtn.classList.add('is-hidden');
      heroPlayBtn.setAttribute('aria-hidden', 'true');
      heroPlayBtn.tabIndex = -1;
    });
  }

  /* ----------------------------------------------------------
     FAQ ACCORDION — grid-template-rows animation, single-open
  ---------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-question');
    const toggle = item.querySelector('.faq-toggle');
    if (!btn || !toggle) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      faqItems.forEach((other) => {
        if (other !== item && other.classList.contains('is-open')) {
          other.classList.remove('is-open');
          const otherBtn = other.querySelector('.faq-question');
          const otherToggle = other.querySelector('.faq-toggle');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherToggle) otherToggle.textContent = '+';
        }
      });

      item.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      toggle.textContent = isOpen ? '+' : '−';
    });
  });

  /* ----------------------------------------------------------
     PORTFOLIO CATEGORY FILTER
     Cards fade out together, then the non-matching ones are
     pulled from the flow with display:none so the grid reflows
     cleanly before the matching set fades back in.
  ---------------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');
  const portfolioGrid = document.getElementById('portfolioGrid');

  if (filterBtns.length && portfolioCards.length) {

    const TRANSITION_MS = 250;

    const applyFilter = (filter, instant = false) => {
      const commit = () => {
        portfolioCards.forEach((card) => {
          const matches = card.dataset.category === filter;
          card.style.display = matches ? '' : 'none';
        });

        if (portfolioGrid) void portfolioGrid.offsetWidth;

        portfolioCards.forEach((card) => {
          card.classList.toggle('is-hidden', card.dataset.category !== filter);
        });
      };

      if (instant) {
        commit();
        return;
      }

      portfolioCards.forEach((card) => card.classList.add('is-hidden'));
      window.setTimeout(commit, TRANSITION_MS);
    };

    const activeBtn = document.querySelector('.filter-btn.is-active');
    if (activeBtn) applyFilter(activeBtn.dataset.filter, true);

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
     BACK TO TOP
  ---------------------------------------------------------- */
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------
     BRAND STRIP MARQUEE
     One clone of the set gives a seamless loop. Duration is
     derived from the set width so the pace is the same on every
     screen. Reduced motion: stays a static, scrollable row.
  ---------------------------------------------------------- */
  const brandStrip = document.getElementById('brandStrip');
  const brandTrack = document.getElementById('brandTrack');
  const brandSet = brandTrack && brandTrack.querySelector('.brand-set');
  if (brandStrip && brandSet && !prefersReducedMotion) {
    const brandClone = brandSet.cloneNode(true);
    brandClone.setAttribute('aria-hidden', 'true');
    brandTrack.appendChild(brandClone);
    brandStrip.classList.add('is-animated');
    const setBrandSpeed = () => {
      const width = brandSet.getBoundingClientRect().width;
      if (width) brandStrip.style.setProperty('--brand-duration', (width / 36).toFixed(1) + 's');
    };
    setBrandSpeed();
    if ('ResizeObserver' in window) new ResizeObserver(setBrandSpeed).observe(brandSet);
  }

  /* ----------------------------------------------------------
     TESTIMONIAL MARQUEE
     The set is cloned once for a seamless loop. Speed is a
     playbackRate that eases toward its target, so hovering slows
     the row down smoothly (never a hard stop) and leaving eases
     it back. Reduced motion / no Web Animations API: the row
     stays a plain, manually scrollable strip.
  ---------------------------------------------------------- */
  const testiMarquee = document.getElementById('testiMarquee');
  const testiTrack = document.getElementById('testiTrack');
  const testiSet = testiTrack && testiTrack.querySelector('.testi-set');

  if (testiMarquee && testiSet && !prefersReducedMotion && typeof testiTrack.animate === 'function') {
    const clone = testiSet.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    testiTrack.appendChild(clone);
    testiMarquee.classList.add('is-animated');

    const SPEED_PX_PER_S = 22;   // comfortable reading pace
    const SLOW_RATE = 0.3;       // hover / touch speed relative to normal
    const EASING = 0.06;         // how quickly speed changes (per frame)

    const anim = testiTrack.animate(
      [{ transform: 'translateY(0)' }, { transform: 'translateY(-50%)' }],
      { duration: 60000, iterations: Infinity, easing: 'linear' }
    );

    const syncDuration = () => {
      const width = testiSet.getBoundingClientRect().height;
      if (!width) return;
      const duration = (width / SPEED_PX_PER_S) * 1000;
      const progress = (anim.currentTime % anim.effect.getTiming().duration) / anim.effect.getTiming().duration || 0;
      anim.effect.updateTiming({ duration });
      anim.currentTime = progress * duration;
    };
    syncDuration();
    if ('ResizeObserver' in window) new ResizeObserver(syncDuration).observe(testiSet);

    let rate = 1;
    let target = 1;
    let rafId = 0;
    const step = () => {
      rate += (target - rate) * EASING;
      if (Math.abs(target - rate) < 0.005) rate = target;
      anim.playbackRate = rate;
      rafId = rate === target ? 0 : requestAnimationFrame(step);
    };
    const setTarget = (value) => {
      target = value;
      if (!rafId) rafId = requestAnimationFrame(step);
    };

    let touchTimer = 0;
    testiMarquee.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'touch') setTarget(SLOW_RATE);
    });
    testiMarquee.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'touch') setTarget(1);
    });
    testiMarquee.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') { window.clearTimeout(touchTimer); setTarget(SLOW_RATE); }
    });
    ['pointerup', 'pointercancel'].forEach((type) => {
      testiMarquee.addEventListener(type, (e) => {
        if (e.pointerType === 'touch') {
          window.clearTimeout(touchTimer);
          touchTimer = window.setTimeout(() => setTarget(1), 1500);
        }
      });
    });
  }

});