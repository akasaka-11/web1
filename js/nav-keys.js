(function () {
  'use strict';
  const menu = document.querySelector('#navMenu .navbar-nav');
  if (!menu) return;
  // Standard Tab order remains available; arrows are an optional navigation shortcut.
  menu.addEventListener('keydown', function (event) {
    const items = [...menu.querySelectorAll('a.nav-link, button')].filter(element => element.getClientRects().length && !element.closest('[hidden]'));
    const current = items.indexOf(document.activeElement);
    if (current < 0) return;
    let target;
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) target = (current + 1) % items.length;
    else if (['ArrowLeft', 'ArrowUp'].includes(event.key)) target = (current - 1 + items.length) % items.length;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = items.length - 1;
    else return;
    event.preventDefault();
    items[target].focus();
  });
})();
