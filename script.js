document.addEventListener('DOMContentLoaded', () => {
  // Theme Switcher Logic
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);

      // Re-load Twitter widgets to match new theme if available
      setTimeout(() => {
        if (window.twttr && window.twttr.widgets) {
          window.twttr.widgets.load();
        }
      }, 100);
    });
  }

  // Mobile Navigation Menu Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const siteNav = document.getElementById('siteNav');

  if (mobileMenuBtn && siteNav) {
    mobileMenuBtn.addEventListener('click', () => {
      siteNav.classList.toggle('active');
    });

    siteNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('active');
      });
    });
  }

  // Embedded Resume Modal Interactivity
  const resumeModalOverlay = document.getElementById('resumeModalOverlay');
  const headerResumeBtn = document.getElementById('headerResumeBtn');
  const heroResumeBtn = document.getElementById('heroResumeBtn');
  const cardResumeBtn = document.getElementById('cardResumeBtn');
  const closeResumeBtn = document.getElementById('closeResumeBtn');
  const printResumeBtn = document.getElementById('printResumeBtn');

  function openResumeModal() {
    if (resumeModalOverlay) {
      resumeModalOverlay.classList.add('active');
      document.body.classList.add('modal-open');
    }
  }

  function closeResumeModal() {
    if (resumeModalOverlay) {
      resumeModalOverlay.classList.remove('active');
      document.body.classList.remove('modal-open');
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
    if (e.key === 'Escape' && resumeModalOverlay && resumeModalOverlay.classList.contains('active')) {
      closeResumeModal();
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
});
