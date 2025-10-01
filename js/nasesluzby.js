(() => {
  const slidesPerView = () => (window.matchMedia('(min-width: 1020px)').matches ? 2 : 1);

  const initCarousel = (root, { interval = 4500 } = {}) => {
    const track   = root.querySelector('.track');
    const slides  = Array.from(root.querySelectorAll('.slide'));
    const dotsBox = root.querySelector('.dots');
    const btnPrev = root.querySelector('[data-prev]');
    const btnNext = root.querySelector('[data-next]');
    const total   = slides.length;

    let index = 0;
    let timer;

    dotsBox.innerHTML = '';
    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Fotka ${i+1} z ${total}`);
      b.addEventListener('click', () => go(i, true));
      dotsBox.appendChild(b);
      return b;
    });

    const maxIndex = () => Math.max(0, total - slidesPerView());

    const update = () => {
      const spv = slidesPerView();
      const stepPct = 100 / spv; 
      const clamp = Math.min(index, maxIndex());
      track.style.transform = `translateX(${-clamp * stepPct}%)`;
      dots.forEach((d, i) => d.setAttribute('aria-current', String(i === index)));
    };

    const go = (i, user=false) => {
      index = i;
      if (index > maxIndex()) index = 0;     
      if (index < 0)          index = maxIndex();
      update();
      if (user) restart();
    };
    const next = () => go(index + 1);
    const prev = () => go(index - 1);

    const start = () => { stop(); timer = setInterval(next, interval); };
    const stop  = () => { if (timer) clearInterval(timer); };
    const restart = () => { start(); };

    btnNext?.addEventListener('click', () => go(index+1, true));
    btnPrev?.addEventListener('click', () => go(index-1, true));
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('touchstart', stop, {passive:true});
    root.addEventListener('touchend', start);
    window.addEventListener('resize', update);

    // Lightbox (jeden na stránce)
    let lb = document.getElementById('lightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'lightbox';
      lb.className = 'lightbox';
      lb.setAttribute('hidden','');
      lb.innerHTML = `<button class="close" aria-label="Zavřít">✕</button><img alt="Náhled" />`;
      document.body.appendChild(lb);
      lb.querySelector('.close').addEventListener('click', () => lb.setAttribute('hidden',''));
      lb.addEventListener('click', (e) => { if (e.target === lb) lb.setAttribute('hidden',''); });
      document.addEventListener('keydown', (e) => { if (e.key === "Escape") lb.setAttribute('hidden',''); });
    }
    slides.forEach(slide => {
      slide.addEventListener('click', () => {
        const src = slide.querySelector('img')?.getAttribute('src');
        if (!src) return;
        lb.querySelector('img').setAttribute('src', src);
        lb.removeAttribute('hidden');
      });
    });

    update();
    start();
  };

  const initAll = () => {
    document.querySelectorAll('.carousel').forEach(c => initCarousel(c));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();







