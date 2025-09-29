(() => {
  const mountHeader = async () => {
    const host = document.getElementById("site-header");
    if (!host) return;
    try {
      const res = await fetch("/html/header.html", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      host.innerHTML = await res.text();
      initNavBehavior();
    } catch (e) { console.error("Header load failed", e); }
  };

  const initNavBehavior = () => {
    const header = document.querySelector(".site-header");
    const scroller = document.querySelector("main");
    const navList = header?.querySelector("#primary-nav ul");
    const toggle = header?.querySelector(".nav-toggle");
    const links = Array.from(header?.querySelectorAll("a[data-nav]") || []);
    const submenuLi = header?.querySelector(".has-submenu");
    const submenuTrigger = header?.querySelector(".submenu-trigger");
    const submenuEl = header?.querySelector(".has-submenu .submenu");
    const subLinks = Array.from(header?.querySelectorAll("a[data-sub]") || []);

    /* přesná pozice submenu na DESKTOPU: vlevo pod „Naše služby“ */
    const positionDesktopSubmenu = () => {
      const desktop = window.matchMedia("(min-width: 769px)").matches;
      if (!desktop || !submenuTrigger || !submenuEl || !header) return;
      const trig = submenuTrigger.getBoundingClientRect();
      const head = header.getBoundingClientRect();
      submenuEl.style.position = "fixed";
      submenuEl.style.left = `${Math.round(trig.left)}px`;
      submenuEl.style.top  = `${Math.round(head.bottom)}px`;
      submenuEl.style.right = "auto";
      submenuEl.style.transform = "none";
      submenuEl.style.textAlign = "left";
    };

    const openSub = () => {
      submenuLi?.setAttribute("data-open", "true");
      submenuTrigger?.setAttribute("aria-expanded", "true");
      positionDesktopSubmenu();
    };
    const closeSub = () => {
      submenuLi?.setAttribute("data-open", "false");
      submenuTrigger?.setAttribute("aria-expanded", "false");
      if (submenuEl) submenuEl.removeAttribute("style");
    };

    // burger
    toggle?.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      navList?.setAttribute("aria-expanded", String(!expanded));
      closeSub();
    });

    // top-level kotvy (#domu/#onas/#reference/#kontakt)
    links.forEach((a) =>
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href") || "";
        if (href.startsWith("/#")) {
          if (location.pathname === "/" || location.pathname.endsWith("/index.html")) {
            e.preventDefault();
            const target = document.querySelector(href.replace("/", ""));
            if (target && scroller) scroller.scrollTo({ top: target.offsetTop, behavior: "smooth" });
          }
          toggle?.setAttribute("aria-expanded", "false");
          navList?.setAttribute("aria-expanded", "false");
          closeSub();
        }
      })
    );

    // submenu otevřít POUZE klikem
    submenuTrigger?.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = submenuLi?.getAttribute("data-open") === "true";
      isOpen ? closeSub() : openSub();
    });

    // klik na položku submenu => scroll v rámci indexu a zavřít
    subLinks.forEach((s) =>
      s.addEventListener("click", (e) => {
        const href = s.getAttribute("href") || "";
        if (href.startsWith("/#")) {
          if (location.pathname === "/" || location.pathname.endsWith("/index.html")) {
            e.preventDefault();
            const target = document.querySelector(href.replace("/", ""));
            if (target && scroller) scroller.scrollTo({ top: target.offsetTop, behavior: "smooth" });
          }
        }
        closeSub();
        toggle?.setAttribute("aria-expanded", "false");
        navList?.setAttribute("aria-expanded", "false");
      })
    );

    // klik mimo header => zavřít
    document.addEventListener("click", (e) => {
      if (!header?.contains(e.target)) {
        closeSub();
        toggle?.setAttribute("aria-expanded", "false");
        navList?.setAttribute("aria-expanded", "false");
      }
    });

    // ESC => zavřít
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeSub();
        toggle?.setAttribute("aria-expanded", "false");
        navList?.setAttribute("aria-expanded", "false");
      }
    });

    // drž pozici při resize/scrollu jen když je otevřeno
    const syncWhenOpen = () => {
      if (submenuLi?.getAttribute("data-open") === "true") positionDesktopSubmenu();
    };
    window.addEventListener("resize", syncWhenOpen);
    window.addEventListener("scroll", syncWhenOpen, { passive: true });

    // výchozí stav
    closeSub();
  };

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", mountHeader);
  else mountHeader();
})();















