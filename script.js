document.addEventListener('DOMContentLoaded', () => {

  // Theme toggle
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

  // Header elevation on scroll
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

  // Start a project modal
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
  }

  // Contact forms → Web3Forms
  document.querySelectorAll('form[data-web3form]').forEach((form) => {
    const submitBtn = form.querySelector('button[type="submit"]');
    const statusEl = form.querySelector('.form-status');

    const showStatus = (message, isError) => {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.classList.toggle('is-error', !!isError);
      statusEl.hidden = false;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.dataset.sending === 'true') return;

      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();

      if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showStatus('Please enter your name, a valid email, and a message.', true);
        return;
      }

      // Reply goes to the visitor, not the inbox owner
      data.set('replyto', email);
      data.set('name', name);
      data.set('message', message);

      form.dataset.sending = 'true';
      const originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
      if (statusEl) statusEl.hidden = true;

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: data
        });
        const result = await response.json().catch(() => ({}));

        if (response.ok && result.success) {
          form.reset();
          showStatus("Thanks! Your message was sent — I'll get back to you within one business day.", false);
        } else {
          showStatus((result && result.message) || 'Sorry, your message could not be sent. Please try again.', true);
        }
      } catch (err) {
        showStatus('Network error — your message was not sent. Please check your connection and try again.', true);
      } finally {
        form.dataset.sending = 'false';
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
      }
    });
  });

  // Hero video play trigger
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

  // FAQ accordion
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

  // Portfolio category filter
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

  // Back to top
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Brand strip marquee
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

  // Testimonial marquee
  const testiMarquee = document.getElementById('testiMarquee');
  const testiTrack = document.getElementById('testiTrack');
  const testiSet = testiTrack && testiTrack.querySelector('.testi-set');

  if (testiMarquee && testiSet && !prefersReducedMotion && typeof testiTrack.animate === 'function') {
    const clone = testiSet.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    testiTrack.appendChild(clone);
    testiMarquee.classList.add('is-animated');

    const SPEED_PX_PER_S = 22;
    const SLOW_RATE = 0.3;
    const EASING = 0.06;

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