(() => {
  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  const root = document.documentElement;
  const header = document.getElementById("header");
  const nav = document.getElementById("siteNav");
  const menuBtn = document.getElementById("menuBtn");
  const toast = document.getElementById("toast");
  const field = document.getElementById("field");
  let toastTimer;

  const reduced = () => reducedQuery.matches;

  const isMenuOpen = () => document.body.classList.contains("menu-open");

  const closeMenu = () => {
    if (!isMenuOpen()) return;
    document.body.classList.remove("menu-open");
    document.documentElement.classList.remove("menu-open");
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Open menu");
      if (nav && (document.activeElement === nav || nav.contains(document.activeElement))) {
        menuBtn.focus();
      }
    }
  };

  const openMenu = () => {
    if (isMenuOpen()) return;
    document.body.classList.add("menu-open");
    document.documentElement.classList.add("menu-open");
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "true");
      menuBtn.setAttribute("aria-label", "Close menu");
    }
    const firstLink = nav && nav.querySelector("a");
    if (firstLink) firstLink.focus();
  };

  const shouldAllowMenuScroll = (target) =>
    !!(nav && target && nav.contains(target) && nav.scrollHeight > nav.clientHeight);

  const preventBackgroundScroll = (event) => {
    if (!isMenuOpen() || shouldAllowMenuScroll(event.target)) return;
    event.preventDefault();
  };
  document.addEventListener("touchmove", preventBackgroundScroll, { passive: false });
  document.addEventListener("wheel", preventBackgroundScroll, { passive: false });

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      if (isMenuOpen()) closeMenu();
      else openMenu();
    });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (isMenuOpen()) {
        event.preventDefault();
        closeMenu();
      }
      return;
    }
    if (event.key !== "Tab" || !isMenuOpen() || !nav) return;
    const focusable = [menuBtn, ...nav.querySelectorAll("a, button")].filter(Boolean);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860 && isMenuOpen()) closeMenu();
  });

  const onScrollHeader = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      closeMenu();
      const offset = header ? header.getBoundingClientRect().height : 64;
      const resumeNavEl = document.querySelector(".resume-nav");
      const resumeBar = resumeNavEl && window.innerWidth <= 860
        ? resumeNavEl.getBoundingClientRect().height + 8
        : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset - resumeBar;
      window.scrollTo({ top, behavior: reduced() ? "auto" : "smooth" });
      if (history.pushState) history.pushState(null, "", id);
    });
  });

  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  if (sections.length && "IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("in-view", entry.isIntersecting);
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            const href = link.getAttribute("href") || "";
            link.classList.toggle("active", href.endsWith(`#${id}`));
          });
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    sections.forEach((section) => navObserver.observe(section));
  }

  const revealItems = document.querySelectorAll(".reveal");
  revealItems.forEach((el, index) => {
    el.style.setProperty("--delay", `${(index % 6) * 60}ms`);
  });
  const showAllReveals = () => revealItems.forEach((el) => el.classList.add("is-visible"));
  if (revealItems.length) {
    if (reduced() || !("IntersectionObserver" in window)) {
      showAllReveals();
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      revealItems.forEach((el) => revealObserver.observe(el));
      window.setTimeout(showAllReveals, 4000);
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
      const label = btn.querySelector(".copy-label") || btn;
      try {
        await navigator.clipboard.writeText(value);
        const original = label.textContent;
        btn.classList.add("is-copied");
        if (btn.tagName === "BUTTON") label.textContent = "Copied";
        showToast(`Copied “${value}” to clipboard!`);
        setTimeout(() => {
          btn.classList.remove("is-copied");
          if (btn.tagName === "BUTTON" && original) label.textContent = original;
        }, 1600);
      } catch (error) {
        showToast("Could not copy. Please try again.");
      }
    });
  });

  const resumeNav = document.querySelector(".resume-nav");
  if (resumeNav && "IntersectionObserver" in window) {
    const resumeLinks = resumeNav.querySelectorAll('a[href^="#"]');
    const resumeTargets = [...resumeLinks]
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);
    if (resumeTargets.length) {
      const resumeObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.getAttribute("id");
            resumeLinks.forEach((link) => {
              link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
            });
          });
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );
      resumeTargets.forEach((section) => resumeObserver.observe(section));
    }
  }

  /* Cursor + magnetic + tilt */
  const cursorRoot = document.querySelector(".cursor");
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorRing = document.querySelector(".cursor-ring");
  let mouseX = window.innerWidth * 0.7;
  let mouseY = window.innerHeight * 0.2;
  let ringX = mouseX;
  let ringY = mouseY;

  const isHot = (node) =>
    !!(node && node.closest && node.closest("a, button, .work-item, [data-magnetic], [data-magnetic-row], [data-tilt]"));

  if (cursorRoot && cursorDot && cursorRing && finePointer.matches && !reduced()) {
    root.classList.add("has-cursor");
    window.addEventListener("pointermove", (event) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      mouseX = event.clientX;
      mouseY = event.clientY;
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      root.classList.toggle("is-pointer-hot", isHot(event.target));
    }, { passive: true });

    const tickCursor = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      requestAnimationFrame(tickCursor);
    };
    requestAnimationFrame(tickCursor);
  }

  if (finePointer.matches && !reduced()) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (event) => {
        const r = el.getBoundingClientRect();
        const x = event.clientX - r.left - r.width / 2;
        const y = event.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.22}px, ${y * 0.28}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });

    document.querySelectorAll("[data-magnetic-row]").forEach((el) => {
      el.addEventListener("pointermove", (event) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--spot-x", `${event.clientX - r.left}px`);
      });
    });

    document.querySelectorAll("[data-tilt]").forEach((el) => {
      el.addEventListener("pointermove", (event) => {
        const r = el.getBoundingClientRect();
        const rx = ((event.clientY - r.top) / r.height - 0.5) * -6;
        const ry = ((event.clientX - r.left) / r.width - 0.5) * 6;
        el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
        el.style.transition = "transform 500ms cubic-bezier(0.45, 0, 0.1, 1)";
        window.setTimeout(() => { el.style.transition = ""; }, 500);
      });
    });
  }

  /* Gentle hero parallax */
  const heroFrame = document.querySelector(".hero-frame");
  if (heroFrame && !reduced()) {
    const onParallax = () => {
      const y = Math.min(window.scrollY, 800);
      heroFrame.style.transform = `translate3d(0, ${y * 0.12}px, 0)`;
    };
    window.addEventListener("scroll", onParallax, { passive: true });
  }

  /* Ambient field — WebGL shader with 2D fallback, started after first paint */
  const startField = () => {
    if (!field) return;
    const start = () => initField(field, { reduced: reduced(), mouse: () => ({ x: mouseX, y: mouseY }) });
    if ("requestIdleCallback" in window) requestIdleCallback(start, { timeout: 900 });
    else window.setTimeout(start, 200);
  };
  startField();

  reducedQuery.addEventListener("change", () => {
    if (reduced()) showAllReveals();
  });
})();

function initField(canvas, { reduced, mouse }) {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    powerPreference: "low-power",
  });
  if (gl) {
    try {
      startWebGLField(canvas, gl, reduced, mouse);
      return;
    } catch (error) {
      /* fall through to 2d */
    }
  }
  startCanvas2D(canvas, reduced, mouse);
}

function startWebGLField(canvas, gl, reduced, mouse) {
  const vert = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;
  const frag = `
    precision mediump float;
    uniform vec2 u_res;
    uniform vec2 u_mouse;
    uniform float u_time;
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      vec2 p = uv * vec2(u_res.x / u_res.y, 1.0);
      float t = u_time * 0.015;
      float n = noise(p * 2.4 + vec2(t, t * 0.6));
      n += 0.5 * noise(p * 6.0 - vec2(t * 0.4, t * 0.8));
      vec3 col = vec3(0.02, 0.02, 0.018);
      col += vec3(0.16, 0.15, 0.13) * smoothstep(0.45, 1.0, n) * 0.22;
      vec2 m = u_mouse / u_res;
      m.y = 1.0 - m.y;
      float glow = 0.012 / (0.012 + distance(uv, m));
      col += vec3(0.9, 0.88, 0.82) * glow * 0.07;
      col += vec3(0.7, 0.68, 0.62) * (0.05 / (0.18 + distance(uv, vec2(0.72, 0.18))));
      float star = step(0.996, hash(floor(gl_FragCoord.xy / 2.0)));
      float twinkle = 0.55 + 0.45 * sin(u_time * 1.6 + hash(floor(gl_FragCoord.xy)) * 20.0);
      col += vec3(0.95, 0.93, 0.88) * star * twinkle * 0.55;
      gl_FragColor = vec4(col, 0.95);
    }
  `;

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  };

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vert));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(program, "u_res");
  const uMouse = gl.getUniformLocation(program, "u_mouse");
  const uTime = gl.getUniformLocation(program, "u_time");

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };

  let playing = !document.hidden && !reduced;
  const draw = (now) => {
    resize();
    const m = mouse();
    const dpr = canvas.width / window.innerWidth;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uMouse, m.x * dpr, m.y * dpr);
    gl.uniform1f(uTime, reduced ? 0 : now * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (playing && !reduced) requestAnimationFrame(draw);
  };

  document.addEventListener("visibilitychange", () => {
    playing = !document.hidden && !reduced;
    if (playing) requestAnimationFrame(draw);
  });
  window.addEventListener("resize", () => { if (!playing) requestAnimationFrame(draw); }, { passive: true });
  requestAnimationFrame(draw);
}

function startCanvas2D(canvas, reduced, mouse) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const stars = Array.from({ length: 90 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.2 + 0.2,
    s: Math.random() * 0.4 + 0.1,
  }));
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  let playing = !document.hidden && !reduced;
  const draw = (now) => {
    resize();
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);
    const t = now * 0.00012;
    const m = mouse();
    const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 360);
    glow.addColorStop(0, "rgba(238,234,227,0.07)");
    glow.addColorStop(1, "rgba(238,234,227,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    stars.forEach((star) => {
      const x = ((star.x + t * star.s) % 1) * w;
      const y = star.y * h;
      ctx.fillStyle = `rgba(238,234,227,${0.25 + star.s * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });
    if (playing && !reduced) requestAnimationFrame(draw);
  };
  document.addEventListener("visibilitychange", () => {
    playing = !document.hidden && !reduced;
    if (playing) requestAnimationFrame(draw);
  });
  requestAnimationFrame(draw);
}
