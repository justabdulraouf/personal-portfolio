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

  // Dynamic Tweet Rotation System
  const tweets = [
    {
      text: `&gt; be me<br>&gt; BA &amp; marketing grad<br>&gt; never touched a single line of code<br>&gt; discovered tpot (hell)<br>&gt; subscribed to @GeminiApp AI Pro<br>&gt; talked to @antigravity in english<br>&gt; antigravity talked with git &amp; cloudflare<br>&gt; launched my portfolio in less than 2hrs<br>&gt; <span class="highlight-link">justabdulraouf.me</span>`,
      views: '606',
      likes: '15',
      replies: '6',
      url: 'https://x.com/justabdulraouf/status/2082175968433619396'
    },
    {
      text: `I am a writer at heart, crafting narratives that inspire. From tweets to micro-storytelling.<br><br>One non-negotiable principle: <strong>I would never use artificial intelligence to write content</strong>. The soul of storytelling belongs to human experience.`,
      views: '840',
      likes: '28',
      replies: '9',
      url: 'https://x.com/justabdulraouf'
    },
    {
      text: `When not immersed in writing or tech, you’ll find me at the gym working out to become my best self.<br><br>The world is making us sick and sedentary — gotta fight that however we can. 🏋️‍♂️`,
      views: '725',
      likes: '24',
      replies: '7',
      url: 'https://x.com/justabdulraouf'
    },
    {
      text: `Constantly seeking the latest innovations, experimenting with emerging AI models, and facilitating discussions about their potential impact on humanity.<br><br>Curiosity &gt; passive observation.`,
      views: '910',
      likes: '33',
      replies: '11',
      url: 'https://x.com/justabdulraouf'
    },
    {
      text: `I’m an Apple ecosystem enthusiast. Holding my iPhone, capturing the world’s beauty around and telling my story with raw, unfiltered shots. 📸<br><br>Simplicity in design is the ultimate sophistication.`,
      views: '590',
      likes: '21',
      replies: '5',
      url: 'https://x.com/justabdulraouf'
    },
    {
      text: `In my role as Social Media &amp; Community Manager at @stabraqts, I represent modern Muslims by inspiring and amplifying the voices of dreamers and changemakers globally.`,
      views: '1.2K',
      likes: '48',
      replies: '15',
      url: 'https://x.com/justabdulraouf'
    }
  ];

  const tweetTextEl = document.getElementById('tweetText');
  const tweetViewsEl = document.getElementById('tweetViews');
  const tweetLikesEl = document.getElementById('tweetLikes');
  const tweetRepliesEl = document.getElementById('tweetReplies');
  const tweetActionBtn = document.getElementById('tweetActionBtn');
  const tweetShuffleBtn = document.getElementById('tweetShuffleBtn');
  const tweetSpotlightCard = document.getElementById('tweetSpotlightCard');

  let currentTweetIndex = 0;

  function applyTweetData(tweet) {
    if (tweetTextEl) tweetTextEl.innerHTML = tweet.text;
    if (tweetViewsEl) tweetViewsEl.textContent = tweet.views;
    if (tweetLikesEl) tweetLikesEl.textContent = tweet.likes;
    if (tweetRepliesEl) tweetRepliesEl.textContent = tweet.replies;
    if (tweetActionBtn) tweetActionBtn.setAttribute('href', tweet.url);
  }

  function renderTweet(index, animate = false) {
    const tweet = tweets[index];
    if (!tweet) return;

    if (animate && tweetSpotlightCard) {
      tweetSpotlightCard.style.opacity = '0.3';
      tweetSpotlightCard.style.transform = 'translateY(4px)';
      setTimeout(() => {
        applyTweetData(tweet);
        tweetSpotlightCard.style.opacity = '1';
        tweetSpotlightCard.style.transform = 'translateY(0)';
      }, 150);
    } else {
      applyTweetData(tweet);
    }
  }

  // Pick a fresh tweet on each visit/reload (different from previous)
  const lastIndex = localStorage.getItem('last_tweet_index');
  let nextIndex = 0;
  if (lastIndex !== null) {
    nextIndex = (parseInt(lastIndex, 10) + 1) % tweets.length;
  } else {
    nextIndex = Math.floor(Math.random() * tweets.length);
  }

  currentTweetIndex = nextIndex;
  localStorage.setItem('last_tweet_index', nextIndex.toString());
  renderTweet(currentTweetIndex, false);

  if (tweetShuffleBtn) {
    tweetShuffleBtn.addEventListener('click', () => {
      currentTweetIndex = (currentTweetIndex + 1) % tweets.length;
      localStorage.setItem('last_tweet_index', currentTweetIndex.toString());
      renderTweet(currentTweetIndex, true);
    });
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

