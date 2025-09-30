(() => {
  /* ===== PRELOADER (původní chování) ===== */
  const preloader = document.getElementById("preloader");
  const hide = () =>
    preloader
      ?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" })
      .finished.then(() => preloader?.remove())
      .catch(() => preloader?.remove());

  if (preloader) {
    preloader.hidden = false;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", hide, { once: true });
    } else {
      hide();
    }
    // pojistka kdyby se animace nespustila
    setTimeout(() => { if (document.body.contains(preloader)) hide(); }, 2000);
  }

  /* ===== Pomocné ===== */
  async function fetchHTML(url) {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status} – ${url}`);
    return await res.text();
  }
  function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  /* ===== Načtení sekce O nás ===== */
  async function loadOnas() {
    const app = document.getElementById("app");
    const domu = document.getElementById("domu");
    if (!app || !domu) return;

    // nezdvojovat, pokud už je v DOM
    if (document.getElementById("onas")) return;

    try {
      const html = await fetchHTML("/html/onas.html");
      const temp = document.createElement("div");
      temp.innerHTML = html.trim();
      const section = temp.firstElementChild; // <section id="onas">

      if (section) {
        insertAfter(section, domu);

        // Dej vědět ostatním skriptům (onas.js), že je sekce připravena
        document.dispatchEvent(
          new CustomEvent("section:loaded", { detail: { id: "onas" } })
        );
      }
    } catch (err) {
      console.error("Chyba při načítání O nás:", err);
    }
  }

  /* ===== Načtení FOOTERU ===== */
  async function loadFooter() {
    const container = document.getElementById("site-footer");
    if (!container) return; // placeholder chybí → nic neděláme
    // pokud už je naplněný, neřeš
    if (container.children.length) return;

    try {
      const html = await fetchHTML("/html/footer.html");
      container.innerHTML = html;
    } catch (err) {
      console.error("Chyba při načítání footeru:", err);
    }
  }

  /* ===== Start ===== */
  function start() {
    loadOnas();
    loadFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();














