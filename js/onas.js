(function () {
  function animateNumber(el, target, duration = 1500) {
    const start = 0;
    const startTime = performance.now();

    function step(now) {
      const p = Math.min((now - startTime) / duration, 1);
      const val = Math.floor(start + (target - start) * p);
      el.textContent = String(val);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initCounters(root) {
    const nums = root.querySelectorAll('.number[data-target]');
    if (!nums.length) return;

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          nums.forEach(n => {
            const target = parseInt(n.getAttribute('data-target') || '0', 10);
            if (n.dataset.done === '1') return;
            animateNumber(n, target);
            n.dataset.done = '1';
          });
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });

    io.observe(root);
  }

  function initOnas() {
    const onas = document.getElementById('onas');
    if (!onas) return;
    initCounters(onas);
  }

  document.addEventListener('DOMContentLoaded', initOnas);

  document.addEventListener('section:loaded', (e) => {
    if (e.detail && e.detail.id === 'onas') {
      initOnas();
    }
  });
})();

