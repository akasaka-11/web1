(function () {
  'use strict';
  const STORAGE_KEY = 'copperSpoonTheme';
  const root = document.documentElement;
  function savedTheme() {
    try { return localStorage.getItem(STORAGE_KEY) === 'night' ? 'night' : 'day'; }
    catch { return 'day'; }
  }
  function applyTheme(theme) {
    const isNight = theme === 'night';
    root.setAttribute('data-bs-theme', isNight ? 'dark' : 'light');
    const button = document.getElementById('themeToggle');
    if (!button) return;
    button.textContent = isNight ? 'Day' : 'Night';
    button.setAttribute('aria-pressed', String(isNight));
    button.setAttribute('aria-label', isNight ? 'Switch to day theme' : 'Switch to night theme');
  }
  // Head execution sets the root theme before paint; DOM readiness wires the control.
  applyTheme(savedTheme());
  function initialize() {
    applyTheme(savedTheme());
    document.getElementById('themeToggle')?.addEventListener('click', function () {
      const next = root.getAttribute('data-bs-theme') === 'dark' ? 'day' : 'night';
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); }
      catch { window.showToast?.('Theme changed for this page. Browser storage is unavailable.', 'info'); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
  // A second open tab follows preference changes made in the first tab.
  window.addEventListener('storage', event => {
    if (event.key === STORAGE_KEY || event.key === null) applyTheme(savedTheme());
  });
})();
