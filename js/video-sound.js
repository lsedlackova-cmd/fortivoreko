(() => {
  const video = document.getElementById("intro-video");
  const btn = document.getElementById("soundToggle");
  if (!video || !btn) return;

  btn.addEventListener("click", () => {
    video.muted = !video.muted;
    btn.textContent = video.muted ? "🔇" : "🔊";
    btn.setAttribute("aria-label", video.muted ? "Zapnout zvuk" : "Vypnout zvuk");
  });
})();







