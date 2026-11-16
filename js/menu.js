(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const dishList = $('dishList');
  if (!dishList || typeof menuItems === 'undefined') return;
  const search = $('dishSearchInput');
  const suggestions = $('dishSuggestions');
  const buttons = [...document.querySelectorAll('.filter-btn')];
  const validFilters = buttons.map(button => button.dataset.filter);
  let suggestionIndex = -1;
  let storageWarningShown = false;

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch {
      if (!storageWarningShown) {
        window.showToast?.('Browser storage is unavailable. Your choices will last for this page only.', 'info');
        storageWarningShown = true;
      }
      return false;
    }
  }

  const savedSearch = read('copperSpoonMenuFilter', {});
  let filter = validFilters.includes(savedSearch?.filter) ? savedSearch.filter : 'all';
  search.value = typeof savedSearch?.query === 'string' ? savedSearch.query : '';

  // Rebuild prices from the current menu instead of trusting editable stored totals.
  const savedOrder = read('copperSpoonOrder', []);
  let order = Array.isArray(savedOrder) ? savedOrder.filter(item => item && typeof item.name === 'string' && Number.isInteger(item.quantity) && item.quantity > 0).map(item => {
    const dish = menuItems.find(dish => dish.name === item.name);
    return dish ? { name: dish.name, price: dish.price, quantity: Math.min(item.quantity, 99) } : null;
  }).filter(Boolean) : [];

  const price = value => '$' + value.toFixed(2);
  function matchesCategory(dish) {
    if (filter === 'all') return true;
    if (filter === 'vegetarian') return dish.vegetarian;
    if (filter === 'under10') return dish.price < 10;
    return dish.category === filter;
  }

  function createDishCard(dish) {
    const column = document.createElement('div');
    column.className = 'col-12 col-md-6 dish-card-wrap';
    const card = document.createElement('article');
    card.className = 'dish-card';
    const category = document.createElement('p');
    category.className = 'eyebrow mb-2';
    category.textContent = dish.category + (dish.vegetarian ? ' · Vegetarian' : '');
    const title = document.createElement('h3');
    title.className = 'h5 brand-font mb-2';
    title.textContent = dish.name;
    const description = document.createElement('p');
    description.className = 'small mb-3';
    description.textContent = dish.description;
    const footer = document.createElement('div');
    footer.className = 'd-flex justify-content-between align-items-center gap-2 mt-auto';
    const cost = document.createElement('span');
    cost.className = 'fw-bold';
    cost.textContent = price(dish.price);
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'btn btn-copper btn-sm';
    add.textContent = 'Add';
    add.setAttribute('aria-label', 'Add ' + dish.name + ' to your order');
    add.addEventListener('click', function () {
      const existing = order.find(item => item.name === dish.name);
      if (existing?.quantity >= 99) { $('orderMessage').textContent = 'This demo supports up to 99 of each dish.'; return; }
      if (existing) existing.quantity++;
      else order.push({ name: dish.name, price: dish.price, quantity: 1 });
      renderOrder();
      save('copperSpoonOrder', order);
      $('orderMessage').textContent = dish.name + ' added to your order.';
      window.showToast?.(dish.name + ' added');
    });
    footer.append(cost, add);
    card.append(category, title, description, footer);
    column.append(card);
    return column;
  }

  function renderDishes() {
    const query = search.value.trim().toLowerCase();
    // Apply category and search in one pass so changing either cannot reset the other.
    const dishes = menuItems.filter(dish => matchesCategory(dish) && (dish.name + ' ' + dish.description).toLowerCase().includes(query));
    dishList.replaceChildren(...dishes.map(createDishCard));
    $('filterStatus').textContent = 'Showing ' + dishes.length + ' of ' + menuItems.length + ' dishes';
    const empty = $('noResults');
    empty.style.display = dishes.length ? 'none' : 'block';
    empty.textContent = 'No dishes match these choices. Try another search or choose All.';
    buttons.forEach(button => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    save('copperSpoonMenuFilter', { filter, query: search.value });
  }

  function renderOrder() {
    const list = $('orderList');
    list.replaceChildren();
    if (!order.length) {
      const item = document.createElement('li');
      item.className = 'small';
      item.textContent = 'Your table is waiting. Add a dish to begin.';
      list.append(item);
    }
    order.forEach(function (item) {
      const row = document.createElement('li');
      row.className = 'order-row';
      const name = document.createElement('span');
      name.textContent = item.quantity + ' × ' + item.name;
      const controls = document.createElement('span');
      controls.className = 'd-flex align-items-center gap-2';
      const total = document.createElement('span');
      total.textContent = price(item.quantity * item.price);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'btn-remove';
      remove.textContent = '×';
      remove.setAttribute('aria-label', 'Remove ' + item.name);
      remove.addEventListener('click', function () {
        order = order.filter(dish => dish.name !== item.name);
        save('copperSpoonOrder', order);
        renderOrder();
        $('orderMessage').textContent = item.name + ' removed.';
      });
      controls.append(total, remove);
      row.append(name, controls);
      list.append(row);
    });
    $('orderCount').textContent = order.reduce((sum, item) => sum + item.quantity, 0);
    $('orderTotal').textContent = price(order.reduce((sum, item) => sum + item.quantity * item.price, 0));
  }

  function hideSuggestions() {
    suggestions.replaceChildren();
    suggestions.style.display = 'none';
    search.setAttribute('aria-expanded', 'false');
    search.removeAttribute('aria-activedescendant');
    suggestionIndex = -1;
  }
  function chooseSuggestion(name) {
    search.value = name;
    filter = 'all';
    hideSuggestions();
    renderDishes();
  }
  function buildSuggestions() {
    hideSuggestions();
    const query = search.value.trim().toLowerCase();
    if (!query) return;
    const matches = menuItems.filter(dish => dish.name.toLowerCase().includes(query)).slice(0, 6);
    if (!matches.length) return;
    matches.forEach(function (dish, index) {
      const option = document.createElement('li');
      option.id = 'suggestion-' + index;
      option.className = 'suggestion';
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', 'false');
      option.textContent = dish.name;
      option.addEventListener('mousedown', function (event) { event.preventDefault(); chooseSuggestion(dish.name); });
      suggestions.append(option);
    });
    suggestions.style.display = 'block';
    search.setAttribute('aria-expanded', 'true');
  }
  search.addEventListener('input', function () { renderDishes(); buildSuggestions(); });
  search.addEventListener('focus', buildSuggestions);
  search.addEventListener('blur', hideSuggestions);
  // The combobox keeps focus in the input; aria-activedescendant names its option.
  search.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') { hideSuggestions(); return; }
    if (event.key === 'Enter' && suggestionIndex >= 0) {
      event.preventDefault();
      chooseSuggestion(suggestions.children[suggestionIndex].textContent);
      return;
    }
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    if (!suggestions.children.length) buildSuggestions();
    const items = [...suggestions.children];
    if (!items.length) return;
    event.preventDefault();
    suggestionIndex = (suggestionIndex + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items.forEach((item, index) => {
      item.classList.toggle('is-active', index === suggestionIndex);
      item.setAttribute('aria-selected', String(index === suggestionIndex));
    });
    search.setAttribute('aria-activedescendant', items[suggestionIndex].id);
  });
  buttons.forEach(button => button.addEventListener('click', function () {
    filter = button.dataset.filter;
    hideSuggestions();
    renderDishes();
  }));
  $('clearOrderBtn').addEventListener('click', function () {
    order = [];
    save('copperSpoonOrder', order);
    renderOrder();
    $('orderMessage').textContent = 'Order cleared.';
  });
  $('placeOrderBtn').addEventListener('click', function () {
    if (!order.length) { $('orderMessage').textContent = 'Add a dish before saving your demo order.'; return; }
    const total = order.reduce((sum, item) => sum + item.quantity * item.price, 0);
    // Only clear the draft after a receipt is saved, so failed storage loses no choices.
    const saved = save('copperSpoonLastOrder', { items: order, total, createdAt: new Date().toISOString() });
    if (!saved) { $('orderMessage').textContent = 'Could not save your order. Enable browser storage and try again.'; return; }
    $('orderMessage').textContent = 'Demo order saved on this device: ' + order.map(item => item.quantity + ' × ' + item.name).join(', ') + ' — ' + price(total) + '. No payment or kitchen order was sent.';
    order = [];
    save('copperSpoonOrder', order);
    renderOrder();
  });
  renderDishes();
  renderOrder();
})();
