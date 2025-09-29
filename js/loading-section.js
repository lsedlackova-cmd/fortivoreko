(() => {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;
  preloader.hidden = false;

  const hide = () =>
    preloader.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" })
      .finished.then(() => preloader.remove())
      .catch(() => preloader.remove());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hide, { once: true });
  } else {
    hide();
  }
  setTimeout(() => { if (document.body.contains(preloader)) hide(); }, 2000);
})();










