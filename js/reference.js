(() => {
  const DATA = [
    {
      id: "ref-1",
      title: "Obnova historické fasády nájemního domu",
      location: "Praha 1",
      year: 2025,
      summary: "Citlivé restaurování štukových prvků, návrat k vápenným omítkám a historické barevnosti s důrazem na prodyšnost.",
      author: "Jana K.",
      quote: "Děkuji, spolehlivá práce a krásný výsledek.",
      thumb: "/img/reference-1.jpg"
    },
    {
      id: "ref-2",
      title: "Rekonstrukce fasády panelového domu",
      location: "Hrádek nad Nisou",
      year: 2024,
      summary: "Kompletní sanace zateplovacího systému, lokální opravy, sjednocení struktury a barevnosti, nové oplechování atik.",
      author: "Petr V.",
      quote: "Vždy přišli na čas, práce odvedena kvalitně. Doporučuji.",
      thumb: "/img/reference-2.jpg"
    },
    {
      id: "ref-3",
      title: "Rekonstrukce interiéru bytu 3+1",
      location: "Praha 5",
      year: 2024,
      summary: "Nové povrchy stěn a stropů, výmalby v minerálních nátěrech, srovnání podkladů a decentní štukové detaily.",
      author: "Lucie S.",
      quote: "Skvělá spolupráce, ochotný tým, byt je k nepoznání.",
      thumb: "/img/reference-3.jpg"
    },
    {
      id: "ref-4",
      title: "Rekonstrukce koupelny v panelovém bytě",
      location: "Liberec",
      year: 2025,
      summary: "Kompletní vybourání jádra, nové hydroizolace, obklady, spárování a sanace větrání pro snížení vlhkosti.",
      author: "Martin D.",
      quote: "Rychle, kvalitně a bez problémů. Jsem moc spokojený.",
      thumb: "/img/reference-4.jpg"
    }
  ];

  function createCard(item) {
    const art = document.createElement("article");
    art.className = "ref-card";

    // levý sloupec: fotka, rok, místo
    const info = document.createElement("div");
    info.className = "ref-info";

    const img = document.createElement("img");
    img.className = "ref-thumb";
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.width = 100;
    img.height = 100;
    img.src = item.thumb || "";

    const year = document.createElement("div");
    year.className = "ref-year";
    year.textContent = item.year;

    const location = document.createElement("div");
    location.className = "ref-location";
    location.textContent = item.location;

    info.append(img, year, location);

    // pravý sloupec: název, summary, citát, autor
    const content = document.createElement("div");
    content.className = "ref-content";

    const h3 = document.createElement("h3");
    h3.className = "ref-title";
    h3.textContent = item.title;

    const p = document.createElement("p");
    p.className = "ref-summary";
    p.textContent = item.summary;

    const quote = document.createElement("div");
    quote.className = "ref-quote";
    quote.textContent = item.quote;

    const author = document.createElement("div");
    author.className = "ref-author";
    author.textContent = item.author;

    content.append(h3, p, quote, author);

    art.append(info, content);
    return art;
  }

  function renderGrid() {
    const grid = document.getElementById("refGrid");
    if (!grid) return;
    const frag = document.createDocumentFragment();
    DATA.forEach(item => frag.appendChild(createCard(item)));
    grid.replaceChildren(frag);
  }

  document.addEventListener("section:loaded", (e) => {
    if (e?.detail?.id === "reference") renderGrid();
  });

  if (document.readyState !== "loading") {
    renderGrid();
  } else {
    document.addEventListener("DOMContentLoaded", renderGrid, { once: true });
  }
})();
// === Mobilní auto-rotátor referencí (bez karuselu) ===
(() => {
  const MQ_MOBILE = window.matchMedia('(max-width: 768px)');
  const MQ_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');

  let timer = null;
  let idx = 0;
  let cards = [];

  function getCards() {
    const grid = document.getElementById('refGrid');
    return grid ? Array.from(grid.querySelectorAll('.ref-card')) : [];
  }

  function show(i) {
    cards.forEach((el, j) => el.classList.toggle('is-active', i === j));
  }

  function start() {
    // jen na mobilu a pokud uživatel nechce omezovat animace
    if (!MQ_MOBILE.matches || MQ_REDUCED.matches) return stop();

    cards = getCards();
    if (cards.length <= 1) return stop();

    idx = 0;
    show(idx);
    stop(); // pojistka
    timer = setInterval(() => {
      idx = (idx + 1) % cards.length;
      show(idx);
    }, 5000); // interval přepínání (ms)

    document.addEventListener('visibilitychange', onVisibilityChange);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
    document.removeEventListener('visibilitychange', onVisibilityChange);
  }

  function onVisibilityChange() {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  }

  // Reakce na změnu šířky (mobil <-> desktop)
  MQ_MOBILE.addEventListener?.('change', () => {
    stop();
    if (MQ_MOBILE.matches) {
      start();
    } else {
      // Při návratu na desktop zrušíme "aktivní" třídu (grid zobrazí všechny)
      cards = getCards();
      cards.forEach(el => el.classList.remove('is-active'));
    }
  });

  // Spuštění po načtení sekce „Reference“
  function bootIfReady() {
    if (document.getElementById('refGrid')) start();
  }

  // Když načítáš sekci dynamicky, chytíme vlastní event
  document.addEventListener('section:loaded', (e) => {
    if (e?.detail?.id === 'reference') bootIfReady();
  });

  // A pro jistotu i po DOMContentLoaded (kdyby to už bylo v DOM)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootIfReady, { once: true });
  } else {
    bootIfReady();
  }
})();





