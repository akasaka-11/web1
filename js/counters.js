/* Animate the original counters once when they enter the viewport.
   Reduced-motion users receive final values immediately. */
(function () {
  const section = document.getElementById('stats');
  if (!section) return;
  const numbers = section.querySelectorAll('[data-count]');
  function display(element, value) {
    const decimals = Number(element.dataset.decimals || 0);
    element.textContent = value.toLocaleString('en-US', {
      minimumFractionDigits: decimals, maximumFractionDigits: decimals
    }) + (element.dataset.suffix || '');
  }
  function animate() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = performance.now();
    function frame(now) {
      const progress = reduced ? 1 : Math.min((now - start) / 1600, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      numbers.forEach(element => display(element, Number(element.dataset.count) * eased));
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (!('IntersectionObserver' in window)) { animate(); return; }
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      observer.disconnect();
      animate();
    }
  }, {threshold: 0.15});
  observer.observe(section);
})();
