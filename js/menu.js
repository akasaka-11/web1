/* menu.js — interactive menu on menu.html.
   1. Filter buttons use a switch statement to decide which dishes to show.
   2. Dishes are drawn from the menuItems array (menu-data.js) with loops.
   3. An "order" object (with methods) keeps track of what the guest picked. */
(function () {
  const dishList = document.querySelector('#dishList');
  if (!dishList || typeof menuItems === 'undefined') return;

  const filterButtons = document.querySelectorAll('.filter-btn');
  const filterStatus = document.querySelector('#filterStatus');
  const orderList = document.querySelector('#orderList');
  const orderTotal = document.querySelector('#orderTotal');
  const orderCount = document.querySelector('#orderCount');
  const orderMessage = document.querySelector('#orderMessage');

  /* ---------- Order object: data + methods ---------- */
  const order = {
    items: [],

    add: function (dish) {
      const existing = this.items.find(function (item) { return item.name === dish.name; });
      if (existing) {
        existing.quantity += 1;
      } else {
        this.items.push({ name: dish.name, price: dish.price, quantity: 1 });
      }
    },

    remove: function (name) {
      // filter() keeps every item except the one being removed
      this.items = this.items.filter(function (item) { return item.name !== name; });
    },

    clear: function () {
      this.items = [];
    },

    count: function () {
      return this.items.reduce(function (sum, item) { return sum + item.quantity; }, 0);
    },

    total: function () {
      return this.items.reduce(function (sum, item) { return sum + item.price * item.quantity; }, 0);
    }
  };

  function formatPrice(amount) {
    return '$' + amount.toFixed(2);
  }

  /* ---------- Filtering with a switch statement ---------- */
  function filterDishes(filter) {
    switch (filter) {
      case 'all':
        return menuItems;
      case 'starters':
      case 'mains':
      case 'desserts':
      case 'drinks':
        return menuItems.filter(function (dish) { return dish.category === filter; });
      case 'vegetarian':
        return menuItems.filter(function (dish) { return dish.vegetarian; });
      case 'under10':
        return menuItems.filter(function (dish) { return dish.price < 10; });
      default:
        return menuItems;
    }
  }

  /* ---------- Drawing the dish cards ---------- */
  function createDishCard(dish, index) {
    const column = document.createElement('div');
    column.className = 'col-12 col-md-6 dish-card-wrap';
    // Stagger the fade-in so cards appear one after another
    column.style.animationDelay = (index * 60) + 'ms';

    const card = document.createElement('div');
    card.className = 'dish-card';

    const title = document.createElement('h3');
    title.className = 'h6 brand-font mb-1';
    title.textContent = dish.name + (dish.vegetarian ? ' *' : '');

    const description = document.createElement('p');
    description.className = 'small mb-2';
    description.textContent = dish.description;

    const footer = document.createElement('div');
    footer.className = 'd-flex justify-content-between align-items-center';

    const price = document.createElement('span');
    price.className = 'fw-bold';
    price.textContent = formatPrice(dish.price);

    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'btn btn-copper btn-sm';
    addButton.textContent = 'Add';
    addButton.addEventListener('click', function () {
      order.add(dish);
      renderOrder();
      orderMessage.textContent = dish.name + ' added.';
      bump(orderCount);
      window.playSound && window.playSound('add');
    });

    footer.append(price, addButton);
    card.append(title, description, footer);
    column.append(card);
    return column;
  }

  function renderDishes(filter) {
    const dishes = filterDishes(filter);
    dishList.innerHTML = '';
    dishes.forEach(function (dish, index) {
      dishList.append(createDishCard(dish, index));
    });
    filterStatus.textContent = 'Showing ' + dishes.length + ' of ' + menuItems.length + ' dishes';
  }

  /* ---------- Drawing the order panel ---------- */
  function renderOrder() {
    orderList.innerHTML = '';

    if (order.items.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'small';
      empty.textContent = 'Nothing yet. Add a dish to begin.';
      orderList.append(empty);
    }

    // for...of loop over the order items
    for (const item of order.items) {
      const row = document.createElement('li');
      row.className = 'order-row';

      const label = document.createElement('span');
      label.textContent = item.quantity + ' \u00d7 ' + item.name;

      const right = document.createElement('span');
      right.className = 'd-flex align-items-center gap-2';

      const lineTotal = document.createElement('span');
      lineTotal.textContent = formatPrice(item.price * item.quantity);

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'btn-remove';
      removeButton.setAttribute('aria-label', 'Remove ' + item.name);
      removeButton.textContent = '\u00d7';
      removeButton.addEventListener('click', function () {
        order.remove(item.name);
        renderOrder();
        window.playSound && window.playSound('click');
      });

      right.append(lineTotal, removeButton);
      row.append(label, right);
      orderList.append(row);
    }

    orderTotal.textContent = formatPrice(order.total());
    orderCount.textContent = order.count();
  }

  // Small CSS animation on an element, restarted every time it is called
  function bump(element) {
    element.classList.remove('bump');
    void element.offsetWidth;
    element.classList.add('bump');
  }

  /* ---------- Events ---------- */
  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (other) {
        const isActive = other === button;
        other.classList.toggle('is-active', isActive);
        other.setAttribute('aria-pressed', String(isActive));
      });
      renderDishes(button.dataset.filter);
      window.playSound && window.playSound('click');
    });
  });

  document.querySelector('#clearOrderBtn').addEventListener('click', function () {
    order.clear();
    renderOrder();
    orderMessage.textContent = 'Order cleared.';
    window.playSound && window.playSound('click');
  });

  document.querySelector('#placeOrderBtn').addEventListener('click', function () {
    if (order.items.length === 0) {
      orderMessage.textContent = 'Your order is empty. Add a dish first.';
      return;
    }
    // map() turns each item into text, join() glues them together
    const summary = order.items.map(function (item) {
      return item.quantity + ' \u00d7 ' + item.name;
    }).join(', ');
    orderMessage.textContent = 'Thank you! ' + summary + ' (' + formatPrice(order.total()) +
      ') is on its way to the kitchen.';
    order.clear();
    renderOrder();
    window.playSound && window.playSound('success');
  });

  renderDishes('all');
  renderOrder();
})();
