/* nav-keys.js — keyboard navigation for the top menu.
   With focus on any menu item: Right/Down = next, Left/Up = previous,
   Home = first, End = last. Focus wraps around at the ends. */
(function () {
  const menu = document.querySelector('#navMenu .navbar-nav');
  if (!menu) return;

  // Only items that are actually visible can receive focus
  // (on phones the menu is collapsed until opened).
  function visibleItems() {
    return Array.from(menu.querySelectorAll('a.nav-link, button')).filter(function (el) {
      return el.offsetParent !== null;
    });
  }

  menu.addEventListener('keydown', function (e) {
    const items = visibleItems();
    const current = items.indexOf(document.activeElement);
    if (current === -1) return;

    let target = null;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        target = (current + 1) % items.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        target = (current - 1 + items.length) % items.length;
        break;
      case 'Home':
        target = 0;
        break;
      case 'End':
        target = items.length - 1;
        break;
      default:
        return;               // any other key keeps its normal behaviour
    }

    e.preventDefault();       // stop the page from scrolling on arrow keys
    items[target].focus();
  });
})();
