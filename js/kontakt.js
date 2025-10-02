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
    const form = root.querySelector("#contactForm");
    if (!form) return;

    const statusEl = form.querySelector("#formStatus");
    const get = (sel) => form.querySelector(sel);

    const setErr = (sel, msg) => { const el = get(sel); if (el) el.textContent = msg || ""; };
    const clearErrs = () => form.querySelectorAll(".error").forEach(el => el.textContent = "");

    form.addEventListener("submit", (e) => {
      clearErrs();
      if (statusEl) statusEl.textContent = "";

      const hp = form.querySelector("#hp")?.value.trim();
      if (hp) {
        e.preventDefault();
        return;
      }

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const place = form.place.value.trim();
      const message = form.message.value.trim();
      const consent = form.consent.checked;
      const copy = form.copy.checked;

      let ok = true;
      if (name.length < 2) { setErr("#err-name", "Zadejte prosím jméno a příjmení."); ok = false; }
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailOk) { setErr("#err-email", "Zadejte platný e-mail."); ok = false; }
      if (!place) { setErr("#err-place", "Uveďte místo realizace."); ok = false; }
      if (!message) { setErr("#err-message", "Napište prosím zprávu."); ok = false; }
      if (!consent) { setErr("#err-consent", "Bez souhlasu se zpracováním nelze odeslat."); ok = false; }
      if (!ok) {
        e.preventDefault();
        if (statusEl) statusEl.textContent = "Zkontrolujte prosím vyznačená pole.";
        return;
      }

const ensureHidden = (name, value) => {
  let n = form.querySelector(`input[name="${name}"]`);
  if (!n) {
    n = document.createElement("input");
    n.type = "hidden";
    n.name = name;
    form.appendChild(n);
  }
  n.value = value;
};
const removeHidden = (name) => {
  form.querySelectorAll(`input[name="${name}"]`).forEach(n => n.remove());
};

ensureHidden("_template", "box");
ensureHidden("_subject", "Poptávka z webu – FORTIVO REKO");

ensureHidden("_replyto", form.querySelector("#email").value.trim());

if (form.copy.checked) {
  ensureHidden("_autoresponse",
    "Děkujeme, že jste nás kontaktovali prostřednictvím našeho webu fortivoreko.cz.\n\n" +
    "Toto je kopie vaší zprávy. Ozveme se vám co nejdříve.\n\n" +
    "Pro více informací navštivte https://fortivoreko.cz"
  );
  ensureHidden("_cc", form.querySelector("#email").value.trim());
} else {
  removeHidden("_autoresponse");
  removeHidden("_cc");
}

[
  ["#name",    "Jméno a příjmení"],
  ["#email",   "E-mail"],
  ["#phone",   "Telefon"],
  ["#place",   "Místo realizace"],
  ["#message", "Zpráva"],
  ["#consent", "Souhlas se zpracováním"],
  ["#copy",    "Kopie zprávy"]
].forEach(([sel, label]) => {
  const el = form.querySelector(sel);
  if (el) el.name = label;
});

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
        form.querySelectorAll("input[name='_autoresponse'], input[name='_cc']").forEach(n => n.remove());
      }
      if (statusEl) statusEl.textContent = "Odesíláme vaši zprávu, prosím vyčkejte…";
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





