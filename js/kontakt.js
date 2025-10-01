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
      "",                 
      c.district || "",   
      c.street || "",     
      c.city || "",       
      "",                 
      c.postcode || "",   
      c.country || ""    
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
    const form = root.getElementById("contactForm");
    if (!form) return;

    const statusEl = form.querySelector("#formStatus");
    const get = (id) => form.querySelector(id);

    const setErr = (id, msg) => { const el = get(id); if (el) el.textContent = msg || ""; };
    const clearErrs = () => form.querySelectorAll(".error").forEach(el => el.textContent = "");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const hp = form.querySelector("#hp")?.value.trim();
      if (hp) return;

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const phone = form.phone.value.trim();
      const place = form.place.value.trim();
      const message = form.message.value.trim();
      const consent = form.consent.checked;
      const copy = form.copy.checked;

      clearErrs();
      let ok = true;

      if (name.length < 2) { setErr("#err-name", "Zadejte jméno a příjmení."); ok = false; }
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailOk) { setErr("#err-email", "Zadejte platný e-mail."); ok = false; }
      if (!place) { setErr("#err-place", "Zadejte místo realizace."); ok = false; }
      if (!message) { setErr("#err-message", "Napište zprávu."); ok = false; }
      if (!consent) { setErr("#err-consent", "Bez souhlasu nelze odeslat."); ok = false; }

      if (!ok) { statusEl.textContent = ""; return; }

      const to = COMPANY.email;
      const subject = `Poptávka z webu – ${name}${place ? " (" + place + ")" : ""}`;

      const lines = [
        `Jméno a příjmení: ${name}`,
        `E-mail: ${email}`,
        phone ? `Telefon: ${phone}` : null,
        `Místo realizace: ${place}`,
        "",
        "Zpráva:",
        message,
        "",
        `Souhlas se zpracováním: ano`,
        `Datum: ${new Date().toLocaleString("cs-CZ")}`,
        `Zdroj: ${location.href}`
      ].filter(Boolean);

      const params = new URLSearchParams();
      params.set("subject", subject);
      params.set("body", lines.join("\n"));
      if (copy && emailOk) params.set("cc", email); 

      const mailtoUrl = `mailto:${encodeURIComponent(to)}?${params.toString()}`;
      statusEl.textContent = "Otevírám e-mail s předvyplněnou zprávou…";
      setTimeout(() => { window.location.href = mailtoUrl; }, 50);
    });
  }

  const boot = () => { initVCard(document); initForm(document); };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  document.addEventListener("section:loaded", (ev) => {
    if (ev?.detail?.id === "kontakt") {
      const root = document.getElementById("kontakt") || document;
      initVCard(root);
      initForm(root);
    }
  });
})();



