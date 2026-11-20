document.addEventListener('DOMContentLoaded', () => {
  // Theme Switcher Logic
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  const twitterContainer = document.getElementById('twitterEmbedContainer');
  const originalTweetHTML = twitterContainer ? twitterContainer.innerHTML : '';

  function currentTheme() {
    return html.getAttribute('data-theme') || 'dark';
  }

  function updateThemeControls(theme) {
    if (!themeToggle) return;
    const isDark = theme === 'dark';
    themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  function syncTwitterTheme(theme) {
    if (!twitterContainer || !originalTweetHTML) return;
    twitterContainer.innerHTML = originalTweetHTML;
    const blockquote = twitterContainer.querySelector('blockquote.twitter-tweet');
    if (blockquote) {
      blockquote.setAttribute('data-theme', theme);
    }
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load(twitterContainer);
    }
  }

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
  updateThemeControls(currentTheme());
  syncTwitterTheme(currentTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const newTheme = currentTheme() === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeControls(newTheme);
      setTimeout(() => syncTwitterTheme(newTheme), 100);
    });
  }

  // Dynamic OS System Theme Listener
  const systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  systemThemeMediaQuery.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      html.setAttribute('data-theme', newSystemTheme);
      updateThemeControls(newSystemTheme);
      setTimeout(() => syncTwitterTheme(newSystemTheme), 100);
    }
  });

  // Mobile Navigation Menu Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const siteNav = document.getElementById('siteNav');

  function setMobileMenuOpen(isOpen) {
    if (!siteNav || !mobileMenuBtn) return;
    siteNav.classList.toggle('active', isOpen);
    mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  if (mobileMenuBtn && siteNav) {
    mobileMenuBtn.addEventListener('click', () => {
      setMobileMenuOpen(!siteNav.classList.contains('active'));
    });
  }

  // Smooth scroll navigation with pixel-perfect header offset
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        if (siteNav && siteNav.classList.contains('active')) {
          setMobileMenuOpen(false);
        }
        const header = document.getElementById('header');
        const headerHeight = header ? header.getBoundingClientRect().height : 72;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      }
    });
  });

  // Embedded Resume Modal Interactivity
  const resumeModalOverlay = document.getElementById('resumeModalOverlay');
  const headerResumeBtn = document.getElementById('headerResumeBtn');
  const heroResumeBtn = document.getElementById('heroResumeBtn');
  const cardResumeBtn = document.getElementById('cardResumeBtn');
  const closeResumeBtn = document.getElementById('closeResumeBtn');
  const printResumeBtn = document.getElementById('printResumeBtn');

  let lastResumeFocus = null;

  function openResumeModal() {
    if (resumeModalOverlay) {
      lastResumeFocus = document.activeElement;
      resumeModalOverlay.classList.add('active');
      resumeModalOverlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      if (closeResumeBtn) closeResumeBtn.focus();
    }
  }

  function closeResumeModal() {
    if (resumeModalOverlay) {
      resumeModalOverlay.classList.remove('active');
      resumeModalOverlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (lastResumeFocus && typeof lastResumeFocus.focus === 'function') {
        lastResumeFocus.focus();
      }
    }
  }

  if (headerResumeBtn) headerResumeBtn.addEventListener('click', openResumeModal);
  if (heroResumeBtn) heroResumeBtn.addEventListener('click', openResumeModal);
  if (cardResumeBtn) cardResumeBtn.addEventListener('click', openResumeModal);
  if (closeResumeBtn) closeResumeBtn.addEventListener('click', closeResumeModal);

  if (resumeModalOverlay) {
    resumeModalOverlay.addEventListener('click', (e) => {
      if (e.target === resumeModalOverlay) {
        closeResumeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (resumeModalOverlay && resumeModalOverlay.classList.contains('active')) {
      closeResumeModal();
      return;
    }
    if (siteNav && siteNav.classList.contains('active')) {
      setMobileMenuOpen(false);
      if (mobileMenuBtn) mobileMenuBtn.focus();
    }
  });

  if (printResumeBtn) {
    printResumeBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Copy to Clipboard with Toast Notification Micro-animations
  const copyBtns = document.querySelectorAll('[data-copy]');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');
  let toastTimer;

  copyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const textToCopy = btn.getAttribute('data-copy');

      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied "${textToCopy}" to clipboard!`);
        }).catch(err => {
          console.error('Failed to copy: ', err);
        });
      }
    });
  });

  function showToast(message) {
    if (!toast) return;
    if (toastText) toastText.textContent = message;

    toast.classList.add('show');
    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Active Navigation Scroll Observer
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  // Load Twitter / X widget once the platform script is ready, in the current theme
  if (!(window.twttr && window.twttr.widgets)) {
    window.addEventListener('load', () => syncTwitterTheme(currentTheme()));
  }
});
