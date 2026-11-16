(function () {
  'use strict';
  const overlay = document.getElementById('popupOverlay');
  if (!overlay) return;
  const close = document.getElementById('popupClose');
  let opener = null;
  let previousOverflow = '';
  let closeTimer;
  const background = [...document.body.children].filter(element => element !== overlay && !['SCRIPT', 'STYLE'].includes(element.tagName));
  const priorInert = new Map();

  function openPopup(event) {
    clearTimeout(closeTimer);
    opener = event.currentTarget;
    previousOverflow = document.body.style.overflow;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Inert background plus a focus trap keeps keyboard interaction inside the dialog.
    background.forEach(element => { priorInert.set(element, element.inert); element.inert = true; });
    (overlay.querySelector('input') || close).focus();
  }
  function closePopup() {
    if (!overlay.classList.contains('show')) return;
    clearTimeout(closeTimer);
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = previousOverflow;
    background.forEach(element => { element.inert = priorInert.get(element) || false; });
    opener?.focus();
  }
  document.querySelectorAll('[data-open-popup]').forEach(button => button.addEventListener('click', openPopup));
  close.addEventListener('click', closePopup);
  overlay.addEventListener('click', event => { if (event.target === overlay) closePopup(); });
  document.addEventListener('keydown', function (event) {
    if (!overlay.classList.contains('show')) return;
    if (event.key === 'Escape') { event.preventDefault(); closePopup(); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...overlay.querySelectorAll('a[href], button, input, select, textarea, [tabindex="0"]')].filter(element => !element.disabled && element.getClientRects().length);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  overlay.addEventListener('form:sent', function () { closeTimer = setTimeout(closePopup, 2500); });
})();
