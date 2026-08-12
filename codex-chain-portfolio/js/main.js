(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile nav ---------- */

  const toggle = document.querySelector(".nav__toggle");
  const navList = document.querySelector(".nav__list");

  if (toggle && navList) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      navList.classList.toggle("is-open", !open);
    });

    navList.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        navList.classList.remove("is-open");
      });
    });
  }

  /* ---------- Scroll reveal ---------- */

  const revealEls = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => observer.observe(el));
  }

  /* ---------- Metric counters ---------- */

  const animateCount = (el) => {
    const target = Number(el.dataset.count || 0);
    const suffix = el.querySelector(".metric__suffix");
    const duration = 1400;
    const start = performance.now();

    const frame = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(target * eased);
      el.querySelector(".metric__value").childNodes[0].textContent = String(value);
      if (suffix) suffix.textContent = el.dataset.suffix || "";
      if (t < 1) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  };

  const metrics = document.querySelectorAll(".metric[data-count]");
  if (metrics.length) {
    if (prefersReducedMotion) {
      metrics.forEach((el) => {
        el.querySelector(".metric__value").childNodes[0].textContent = el.dataset.count;
        const suffix = el.querySelector(".metric__suffix");
        if (suffix) suffix.textContent = el.dataset.suffix || "";
      });
    } else if ("IntersectionObserver" in window) {
      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      metrics.forEach((el) => counterObserver.observe(el));
    } else {
      metrics.forEach(animateCount);
    }
  }

  /* ---------- Ledger ticker ---------- */

  const ledger = document.querySelector("[data-ledger]");
  if (ledger) {
    const glyphs = "0123456789ABCDEF";
    const tick = () => {
      ledger.textContent = Array.from(
        { length: ledger.textContent.length },
        () => glyphs[Math.floor(Math.random() * glyphs.length)]
      ).join("");
    };
    if (!prefersReducedMotion) {
      tick();
      setInterval(tick, 2400);
    }
  }

  /* ---------- Footer year ---------- */

  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
