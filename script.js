(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  const root = document.documentElement;

  root.classList.add("js-ready");

  const header = document.getElementById("header");
  const nav = document.getElementById("siteNav");
  const menuBtn = document.getElementById("menuBtn");
  const toast = document.getElementById("toast");
  let toastTimer;

  const closeMenu = () => {
    document.body.classList.remove("menu-open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    if (menuBtn) menuBtn.setAttribute("aria-label", "Open menu");
  };

  const openMenu = () => {
    document.body.classList.add("menu-open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
    if (menuBtn) menuBtn.setAttribute("aria-label", "Close menu");
  };

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      if (document.body.classList.contains("menu-open")) closeMenu();
      else openMenu();
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      closeMenu();
      const offset = header ? header.getBoundingClientRect().height : 64;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: reduced.matches ? "auto" : "smooth" });
      if (history.pushState) history.pushState(null, "", id);
    });
  });

  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  if (sections.length && "IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            const href = link.getAttribute("href") || "";
            const active = href.endsWith(`#${id}`);
            link.classList.toggle("active", active);
          });
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    sections.forEach((section) => navObserver.observe(section));
  }

  const revealItems = document.querySelectorAll(".reveal");
  if (revealItems.length) {
    if (reduced.matches || !("IntersectionObserver" in window)) {
      revealItems.forEach((el) => el.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
      );
      revealItems.forEach((el) => revealObserver.observe(el));
    }
  }

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  };

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      event.preventDefault();
      const value = btn.getAttribute("data-copy");
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value);
        const original = btn.textContent;
        btn.classList.add("is-copied");
        if (btn.tagName === "BUTTON") btn.textContent = "Copied";
        showToast(`Copied “${value}” to clipboard!`);
        setTimeout(() => {
          btn.classList.remove("is-copied");
          if (btn.tagName === "BUTTON" && original) btn.textContent = original;
        }, 1600);
      } catch (error) {
        showToast("Could not copy. Please try again.");
      }
    });
  });

  const ambient = document.querySelector(".ambient");
  if (ambient && finePointer.matches && !reduced.matches) {
    let frame = 0;
    const move = (event) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        root.style.setProperty("--mx", `${event.clientX}px`);
        root.style.setProperty("--my", `${event.clientY}px`);
        frame = 0;
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
  }

  reduced.addEventListener("change", () => {
    if (reduced.matches) {
      revealItems.forEach((el) => el.classList.add("is-visible"));
    }
  });
})();
