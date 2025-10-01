(() => {
  let form, statusBox, submitBtn, btnText, btnSpinner;
  let formShownAt = Date.now(); // pro časovou pojistku (≥ 2s)

  function qs(s, el = document) { return el.querySelector(s); }

  function setSubmitting(is) {
    submitBtn.disabled = is;
    btnSpinner.style.display = is ? "inline-block" : "none";
    btnText.textContent = is ? "Odesílám…" : "Odeslat zprávu";
  }

  function setFieldError(id, msg) {
    const el = qs(`#err-${id}`);
    if (el) el.textContent = msg || "";
  }

  function clearErrors() {
    ["name","email","phone","place","message","consent"].forEach(f => setFieldError(f, ""));
    statusBox.textContent = "";
  }

  function validate() {
    let ok = true;
    const name = qs("#name").value.trim();
    const email = qs("#email").value.trim();
    const phone = qs("#phone").value.trim();
    const place = qs("#place").value.trim();
    const message = qs("#message").value.trim();
    const consent = qs("#consent").checked;

    if (name.length < 3) { setFieldError("name", "Zadejte prosím jméno a příjmení."); ok = false; }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) { setFieldError("email", "Zadejte platný e-mail."); ok = false; }
    if (phone && phone.length < 6) { setFieldError("phone", "Zkontrolujte prosím telefon."); ok = false; }
    if (place.length < 2) { setFieldError("place", "Uveďte prosím místo realizace."); ok = false; }
    if (!message) { setFieldError("message", "Napište prosím krátkou zprávu."); ok = false; }
    if (!consent) { setFieldError("consent", "Pro odeslání je nutný souhlas se zpracováním."); ok = false; }

    // antispam – honeypot + časová pojistka (2 s)
    const hp = qs("#hp").value.trim();
    if (hp) { ok = false; statusBox.textContent = "Odeslání bylo zablokováno (antispam)."; }
    if (Date.now() - formShownAt < 2000) { ok = false; statusBox.textContent = "Počkejte prosím chvilku a zkuste to znovu."; }

    return ok;
  }

  async function onSubmit(e) {
    e.preventDefault();
    clearErrors();
    if (!validate()) return;

    const payload = {
      name: qs("#name").value.trim(),
      email: qs("#email").value.trim(),
      phone: qs("#phone").value.trim(),
      place: qs("#place").value.trim(),
      message: qs("#message").value.trim(),
      copy: qs("#copy").checked,
      consent: qs("#consent").checked,
      hp: qs("#hp").value.trim(),
      ts: Math.floor(formShownAt / 1000)
    };

    try {
      setSubmitting(true);
      const res = await fetch("/api/contact.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        form.reset();
        statusBox.textContent = "Děkujeme, zpráva byla odeslána. Ozveme se vám.";
      } else if (data && data.error === "validation" && data.fields) {
        Object.entries(data.fields).forEach(([k, v]) => setFieldError(k, v));
        statusBox.textContent = "Opravte prosím zvýrazněné chyby a zkuste to znovu.";
      } else if (data && data.error === "antispam") {
        statusBox.textContent = "Odeslání bylo zablokováno (antispam).";
      } else {
        statusBox.textContent = "Omlouváme se, odeslání se nezdařilo. Zkuste to prosím znovu, nebo napište na info@fortivoreko.cz.";
      }
    } catch (err) {
      statusBox.textContent = "Omlouváme se, odeslání se nezdařilo. Zkuste to prosím znovu, nebo napište na info@fortivoreko.cz.";
    } finally {
      setSubmitting(false);
    }
  }

  function wireUp() {
    form = qs("#contactForm");
    if (!form) return;

    statusBox = qs("#formStatus");
    submitBtn = qs("#submitBtn");
    btnText = qs("#submitBtn .btn-text");
    btnSpinner = qs("#submitBtn .btn-spinner");
    formShownAt = Date.now();

    // živá validace
    ["name","email","phone","place","message","consent"].forEach(id => {
      const el = qs(`#${id}`);
      if (!el) return;
      el.addEventListener("input", () => setFieldError(id, ""));
      if (el.type === "checkbox") el.addEventListener("change", () => setFieldError(id, ""));
    });

    form.addEventListener("submit", onSubmit);
  }

  document.addEventListener("section:loaded", (e) => {
    if (e?.detail?.id === "kontakt") wireUp();
  });

  if (document.readyState !== "loading") {
    wireUp();
  } else {
    document.addEventListener("DOMContentLoaded", wireUp, { once: true });
  }
})();


