(() => {
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
    setTimeout(() => { if (document.body.contains(preloader)) hide(); }, 2000);
  }

  async function fetchHTML(url) {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status} – ${url}`);
    return await res.text();
  }
  function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  async function loadOnas() {
    const app = document.getElementById("app");
    const domu = document.getElementById("domu");
    if (!app || !domu) return;
    if (document.getElementById("onas")) return;

    try {
      const html = await fetchHTML("/html/onas.html");
      const temp = document.createElement("div");
      temp.innerHTML = html.trim();
      const section = temp.firstElementChild;
      if (section) {
        insertAfter(section, domu);
        document.dispatchEvent(new CustomEvent("section:loaded", { detail: { id: "onas" } }));
      }
    } catch (err) {
      console.error("Chyba při načítání O nás:", err);
    }
  }

  async function loadFooter() {
    const container = document.getElementById("site-footer");
    if (!container) return;
    if (container.children.length) return;

    try {
      const html = await fetchHTML("/html/footer.html");
      container.innerHTML = html;
    } catch (err) {
      console.error("Chyba při načítání footeru:", err);
    }
  }

  async function loadReference() {
    const container = document.getElementById("reference");
    if (!container) return;
    if (container.querySelector(".ref-grid")) return;

    try {
      const html = await fetchHTML("/html/reference.html");
      container.innerHTML = html;
      container.querySelectorAll("img").forEach(img => {
        if (!img.hasAttribute("loading")) img.loading = "lazy";
        if (!img.hasAttribute("decoding")) img.decoding = "async";
      });
      document.dispatchEvent(new CustomEvent("section:loaded", { detail: { id: "reference" } }));
    } catch (err) {
      console.error("Chyba při načítání Reference:", err);
    }
  }

  function start() {
    loadOnas();
    loadFooter();
    loadReference();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();















