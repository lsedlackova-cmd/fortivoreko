(() => {
  const STORAGE_KEY = "cookieConsent";
  // ❗❗ DOPLŇ SVÉ GA4 MĚŘICÍ ID (třeba "G-ABCDEF1234")
  const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";

  function loadGA() {
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === "G-XXXXXXXXXX") {
      console.warn("GA Measurement ID není nastaven. Analytics se nenačte.");
      return;
    }
    const s = document.createElement("script");
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    s.async = true;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  }

  function createBanner() {
    const banner = document.createElement("div");
    banner.id = "cookie-consent";
    banner.innerHTML = `
      <p>Používáme technické cookies nutné pro fungování webu a volitelné analytické cookies pro zlepšení služeb.
      <a href="/cookies.html" style="color:#00d0f0; text-decoration:underline;">Více informací</a>.</p>
      <div class="actions">
        <button id="cookie-accept">Povolit analytické cookies</button>
        <button id="cookie-decline">Odmítnout</button>
      </div>
    `;
    document.body.appendChild(banner);

    document.getElementById("cookie-accept").onclick = () => {
      localStorage.setItem(STORAGE_KEY, "accepted");
      removeBanner();
      loadGA();
    };
    document.getElementById("cookie-decline").onclick = () => {
      localStorage.setItem(STORAGE_KEY, "declined");
      removeBanner();
    };
  }

  function removeBanner() {
    const banner = document.getElementById("cookie-consent");
    if (banner) banner.remove();
  }

  const consent = localStorage.getItem(STORAGE_KEY);
  if (consent === "accepted") {
    loadGA();
  } else if (consent === "declined") {
  } else {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", createBanner, { once: true });
    } else {
      createBanner();
    }
  }
})();

