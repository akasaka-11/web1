// ===== TASK 3 — Popup subscription form =====
// Hidden by default. Opens with any button that has data-open-popup.
// Closes with the X button, a click outside the box, or the Esc key.
(function () {
  const overlay = document.getElementById('popupOverlay');
  if (!overlay) return;

  const closeBtn = document.getElementById('popupClose');

  function openPopup() {
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // stop page scrolling behind the popup
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

  // click on the dark area (not on the white box) closes the popup
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closePopup();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closePopup();
  });

  // after a successful subscription close the popup automatically
  overlay.addEventListener('form:valid', function () {
    setTimeout(closePopup, 1800);
  });
})();
