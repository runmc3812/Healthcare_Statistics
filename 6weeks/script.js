(function () {
  "use strict";

  var body = document.body;
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".ind"));
  var mapRows = Array.prototype.slice.call(document.querySelectorAll(".map tbody tr"));
  var status = document.getElementById("filterStatus");
  var hideToggle = document.getElementById("hideToggle");
  var current = null;

  /* ---------- 분모로 모아보기 ---------- */
  function applyFilter(key) {
    current = key;
    chips.forEach(function (c) {
      c.setAttribute("aria-pressed", String(c.dataset.key === key));
    });

    if (!key) {
      body.classList.remove("filtering");
      cards.concat(mapRows).forEach(function (el) { el.classList.remove("match"); });
      status.textContent = "";
      return;
    }

    body.classList.add("filtering");
    var count = 0;
    cards.forEach(function (el) {
      var hit = el.dataset.denom === key;
      el.classList.toggle("match", hit);
      if (hit) count++;
    });
    mapRows.forEach(function (el) {
      el.classList.toggle("match", el.dataset.denom === key);
    });

    var label = chips.filter(function (c) { return c.dataset.key === key; })[0].textContent;
    status.textContent = "분모가 " + label + "인 지표 " + count + "개";

    var first = cards.filter(function (el) { return el.classList.contains("match"); })[0];
    if (first) first.scrollIntoView({ block: "center", behavior: prefersReduced() ? "auto" : "smooth" });
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      applyFilter(current === chip.dataset.key ? null : chip.dataset.key);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && current) applyFilter(null);
  });

  /* ---------- 분모 가리고 연습하기 ---------- */
  var dens = Array.prototype.slice.call(document.querySelectorAll(".ind .den"));

  function setHide(on) {
    body.classList.toggle("hide-den", on);
    hideToggle.setAttribute("aria-pressed", String(on));
    hideToggle.textContent = on ? "분모 모두 보기" : "분모 가리고 연습하기";
    dens.forEach(function (d) {
      d.classList.remove("revealed");
      if (on) {
        d.setAttribute("tabindex", "0");
        d.setAttribute("role", "button");
        d.setAttribute("aria-label", "가려진 분모, 눌러서 확인");
      } else {
        d.removeAttribute("tabindex");
        d.removeAttribute("role");
        d.removeAttribute("aria-label");
      }
    });
  }

  function reveal(d) {
    if (!body.classList.contains("hide-den") || d.classList.contains("revealed")) return;
    d.classList.add("revealed");
    d.removeAttribute("tabindex");
    d.removeAttribute("role");
    d.removeAttribute("aria-label");
  }

  hideToggle.addEventListener("click", function () {
    setHide(!body.classList.contains("hide-den"));
  });

  dens.forEach(function (d) {
    d.addEventListener("click", function () { reveal(d); });
    d.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); reveal(d); }
    });
  });

  /* ---------- 목차 현재 위치 ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".side a"));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    sections.forEach(function (s) { if (s) io.observe(s); });
  }

  function prefersReduced() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
})();
