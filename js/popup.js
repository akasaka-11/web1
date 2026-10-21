
(function () {
  const overlay = document.getElementById('popupOverlay');
  if (!overlay) return;

  const closeBtn = document.getElementById('popupClose');

  function openPopup() {
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; 
    const first = overlay.querySelector('input');
    if (first) first.focus();
  }

  function closePopup() {
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    const msg = overlay.querySelector('.js-success');
    if (msg) msg.remove();
  }

  document.querySelectorAll('[data-open-popup]').forEach(function (btn) {
    btn.addEventListener('click', openPopup);
  });
  closeBtn.addEventListener('click', closePopup);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closePopup();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePopup();
  });

  overlay.addEventListener('form:valid', function () {
    setTimeout(closePopup, 1800);
  });
})();
