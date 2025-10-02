(() => {
  const COMPANY = {
    org: "FORTIVO REKO s.r.o.",
    ico: "236 11 731",
    street: "Kaprova 42/14",
    district: "Staré Město",
    city: "Praha 1",
    postcode: "110 00",
    country: "Česká republika",
    email: "info@fortivoreko.cz",
    phone: "+420 777 087 650",
    url: "https://fortivoreko.cz"
  };

  function buildVCard(c) {
    const adr = [
      "", c.district || "", c.street || "", c.city || "",
      "", c.postcode || "", c.country || ""
    ].join(";");

    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:;${c.org};;;`,
      `FN:${c.org}`,
      `ORG:${c.org}`,
      c.ico ? `NOTE:IČO ${c.ico}` : null,
      `ADR;TYPE=WORK:${adr}`,
      `EMAIL;TYPE=INTERNET,PREF:${c.email}`,
      c.phone ? `TEL;TYPE=WORK,VOICE:${c.phone}` : null,
      `URL:${c.url}`,
      "END:VCARD"
    ].filter(Boolean);

    return lines.join("\r\n");
  }

  function downloadVCard() {
    const vcf = buildVCard(COMPANY);
    const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "FORTIVO-REKO.vcf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function initVCard(root = document) {
    const btn = root.querySelector("#vcardBtn");
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      downloadVCard();
    });
  }

  function initForm(root = document) {
    // ✅ použij querySelector – funguje i když root je element (sekce), ne document
    const form = root.querySelector("#contactForm");
    if (!form) return;

    const statusEl = form.querySelector("#formStatus");
    const get = (sel) => form.querySelector(sel);

    const setErr = (sel, msg) => { const el = get(sel); if (el) el.textContent = msg || ""; };
    const clearErrs = () => form.querySelectorAll(".error").forEach(el => el.textContent = "");

    form.addEventListener("submit", (e) => {
      // vždy začneme čistě
      clearErrs();
      if (statusEl) statusEl.textContent = "";

      // 🧯 honeypot – když je vyplněný, zastavíme (bot)
      const hp = form.querySelector("#hp")?.value.trim();
      if (hp) {
        e.preventDefault();
        return;
      }

      // načtení hodnot
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const place = form.place.value.trim();
      const message = form.message.value.trim();
      const consent = form.consent.checked;
      const copy = form.copy.checked;

      // validace
      let ok = true;
      if (name.length < 2) { setErr("#err-name", "Zadejte prosím jméno a příjmení."); ok = false; }
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailOk) { setErr("#err-email", "Zadejte platný e-mail."); ok = false; }
      if (!place) { setErr("#err-place", "Uveďte místo realizace."); ok = false; }
      if (!message) { setErr("#err-message", "Napište prosím zprávu."); ok = false; }
      if (!consent) { setErr("#err-consent", "Bez souhlasu se zpracováním nelze odeslat."); ok = false; }

      // pokud je chyba → neodesílat
      if (!ok) {
        e.preventDefault();
        if (statusEl) statusEl.textContent = "Zkontrolujte prosím vyznačená pole.";
        return;
      }

      // jen když chce kopii → přidáme skrytá pole pro FormSubmit
      if (copy && emailOk) {
        let autoInput = form.querySelector("input[name='_autoresponse']");
        if (!autoInput) {
          autoInput = document.createElement("input");
          autoInput.type = "hidden";
          autoInput.name = "_autoresponse";
          form.appendChild(autoInput);
        }
        autoInput.value =
          "Děkujeme, že jste nás kontaktovali prostřednictvím našeho webu fortivoreko.cz.\n\n" +
          "Toto je kopie vaší zprávy. Naše odpověď vám přijde v nejbližších dnech.\n\n" +
          "Pro více informací navštivte https://fortivoreko.cz";

        let ccInput = form.querySelector("input[name='_cc']");
        if (!ccInput) {
          ccInput = document.createElement("input");
          ccInput.type = "hidden";
          ccInput.name = "_cc";
          form.appendChild(ccInput);
        }
        ccInput.value = email;
      } else {
        // pojistka: pokud není zaškrtnuto, odstraníme případné staré _autoresponse/_cc
        form.querySelectorAll("input[name='_autoresponse'], input[name='_cc']").forEach(n => n.remove());
      }

      // sem se dostaneme jen při úspěšné validaci
      if (statusEl) statusEl.textContent = "Odesíláme vaši zprávu, prosím vyčkejte…";
      // neblokujeme submit -> FormSubmit odešle formulář podle action/method
    });
  }

  const boot = () => { initVCard(document); initForm(document); };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  // reinicializace při lazy-loadu sekcí
  document.addEventListener("section:loaded", (ev) => {
    if (ev?.detail?.id === "kontakt") {
      const root = document.getElementById("kontakt") || document;
      initVCard(root);
      initForm(root);
    }
  });
})();





