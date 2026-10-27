/* theme.js — Day / Night theme switch.
   Toggles a data-bs-theme attribute on <html> (Bootstrap's dark mode) plus
   a "night" class on <body> for the site's own colours. The choice is
   remembered between pages with localStorage. */
(function () {
  const toggleBtn = document.getElementById('themeToggle');
  if (!toggleBtn) return;

  const root = document.documentElement;
  const STORAGE_KEY = 'copperSpoonTheme';

  function applyTheme(theme) {
    const isNight = theme === 'night';
    root.setAttribute('data-bs-theme', isNight ? 'dark' : 'light');
    document.body.classList.toggle('night', isNight);

    // The button always offers the opposite theme
    toggleBtn.textContent = isNight ? 'Day' : 'Night';
    toggleBtn.setAttribute('aria-pressed', String(isNight));
    toggleBtn.setAttribute('aria-label', isNight ? 'Switch to day theme' : 'Switch to night theme');
  }

  function savedTheme() {
    try { return localStorage.getItem(STORAGE_KEY) || 'day'; }
    catch (err) { return 'day'; }   // storage can be blocked in private mode
  }

  toggleBtn.addEventListener('click', function () {
    const next = document.body.classList.contains('night') ? 'day' : 'night';
    applyTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (err) { /* ignore */ }
    if (window.playSound) window.playSound('click');
  });

  applyTheme(savedTheme());
})();
