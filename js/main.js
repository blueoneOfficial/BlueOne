/* =========================================================
   Nexora — light interactions (no ScrollTrigger)
   ========================================================= */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var hasGSAP = typeof window.gsap !== "undefined";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isSmall = window.matchMedia("(max-width: 760px)").matches;

  /* ---------- Ambient particles ---------- */
  (function particles() {
    var host = document.getElementById("particles");
    if (!host || reduced) return;
    var count = isSmall ? 14 : 26;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var p = document.createElement("i");
      var size = 1 + Math.random() * 2.5;
      p.style.left = Math.random() * 100 + "%";
      p.style.top = Math.random() * 100 + "%";
      p.style.width = size + "px";
      p.style.height = size + "px";
      p.style.opacity = (0.15 + Math.random() * 0.5).toFixed(2);
      p.style.setProperty("--dur", (8 + Math.random() * 14).toFixed(1) + "s");
      p.style.setProperty("--delay", (-Math.random() * 16).toFixed(1) + "s");
      p.style.setProperty("--drift", (Math.random() * 60 - 30).toFixed(1) + "px");
      p.style.background = Math.random() > 0.5 ? "#19e3c1" : "#7c5cff";
      frag.appendChild(p);
    }
    host.appendChild(frag);
  })();

  /* ---------- Scroll progress + header + parallax ---------- */
  var header = document.getElementById("header");
  var progress = document.getElementById("scrollProgress");
  var parallaxEls = [].slice.call(document.querySelectorAll("[data-parallax]"));
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      if (header) header.classList.toggle("is-scrolled", y > 30);
      if (progress) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
      }
      if (!reduced) {
        for (var i = 0; i < parallaxEls.length; i++) {
          var el = parallaxEls[i];
          var speed = parseFloat(el.dataset.parallax) || 0;
          el.style.transform = "translate3d(0," + (y * speed).toFixed(1) + "px,0)";
        }
      }
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Reveal on scroll (IntersectionObserver) ---------- */
  var revealEls = [].slice.call(document.querySelectorAll(".reveal"));

  function showAll() {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // stagger siblings for a nice cascade
        var delay = parseFloat(el.dataset.delay || 0);
        setTimeout(function () { el.classList.add("is-in"); }, delay);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    revealEls.forEach(function (el) {
      var parent = el.parentElement;
      if (parent) {
        var sibs = [].slice.call(parent.children).filter(function (c) { return c.classList.contains("reveal"); });
        var idx = sibs.indexOf(el);
        if (idx > 0) el.dataset.delay = idx * 70;
      }
      io.observe(el);
    });
  } else {
    showAll();
  }

  /* ---------- Hero intro (GSAP if present) ---------- */
  function heroIntro() {
    if (!hasGSAP || reduced) return;
    var lines = document.querySelectorAll(".hero__title .line > span");
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(lines, { yPercent: 115, duration: 0.9, stagger: 0.1 }, 0)
      .from(".hero .pill", { autoAlpha: 0, y: -12, duration: 0.5 }, 0.05)
      .from(".hero__lead", { autoAlpha: 0, y: 18, duration: 0.6 }, 0.35)
      .from(".hero__cta .btn", { autoAlpha: 0, y: 18, duration: 0.55, stagger: 0.08 }, 0.5)
      .from(".hero__mini", { autoAlpha: 0, y: 14, duration: 0.5 }, 0.65)
      .from(".hero__visual", { autoAlpha: 0, y: 30, duration: 0.9 }, 0.3);
  }
  heroIntro();

  /* ---------- Counters (IntersectionObserver) ---------- */
  var counters = [].slice.call(document.querySelectorAll("[data-count]"));
  function runCounter(el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || "";
    var start = performance.now();
    var dur = 1500;
    function frame(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if ("IntersectionObserver" in window && !reduced) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.dataset.count + (el.dataset.suffix || ""); });
  }

  /* ---------- Draw chart (GSAP) ---------- */
  function drawChart() {
    if (!hasGSAP || reduced) return;
    var line = document.querySelector(".chart-line");
    var fill = document.querySelector(".chart-fill");
    if (!line) return;
    var len = line.getTotalLength();
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    if (fill) fill.style.opacity = 0;
    var fired = false;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !fired) {
          fired = true;
          gsap.to(line, { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut", delay: 0.2 });
          if (fill) gsap.to(fill, { opacity: 1, duration: 1, delay: 0.9 });
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    obs.observe(line);
  }
  drawChart();

  /* ---------- Process line grow ---------- */
  var processLine = document.getElementById("processLine");
  if (processLine && "IntersectionObserver" in window) {
    var pio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { processLine.classList.add("is-grown"); pio.disconnect(); }
      });
    }, { threshold: 0.2 });
    pio.observe(processLine);
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    var note = document.getElementById("formNote");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (el) {
        var valid = el.value.trim() !== "" && (el.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value));
        el.classList.toggle("invalid", !valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        note.style.color = "#ff5f57";
        note.textContent = "Please complete the highlighted fields.";
        return;
      }
      note.style.color = "var(--teal)";
      note.textContent = "Thanks! We'll be in touch within one business day.";
      form.reset();
    });
  }

  /* ---------- Year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();